#!/usr/bin/env python3
"""
Importa registros da BDTD para o Solr local a partir da API pública do VuFind
(campo rawData = documento armazenado no Solr de produção).

O índice antigo (Solr 7 / Lucene 7) não pode ser copiado para o Solr 9; por isso
os documentos são reenviados. Campos que o schema local não aceita (cópias
internas do schema LA Referencia, _version_ etc.) são descartados e contados.

Uso (na VPS):
  python3 import_from_api.py --max 5000                 # amostra
  python3 import_from_api.py --by-facet instname_str    # carga completa, particionada
                                                        # por instituição (evita paginação profunda)
Opções: --api, --solr, --page-size, --sleep (pausa entre requisições, p/ não sobrecarregar a produção)
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "BDTD-migracao-vufind11 (import_from_api.py)"


def http_json(url, data=None, timeout=120):
    headers = {"Accept": "application/json", "User-Agent": UA}
    if data is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            if 400 <= exc.code < 500:  # erro do pedido: não adianta repetir
                body = exc.read().decode("utf-8", "replace")
                raise RuntimeError(f"HTTP {exc.code} em {url.split('?')[0]}: {body[:1500]}") from exc
            if attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))
        except Exception as exc:  # noqa: BLE001 - retry em qualquer falha de rede
            if attempt == 4:
                raise
            wait = 5 * (attempt + 1)
            print(f"  ! {exc} — nova tentativa em {wait}s", file=sys.stderr)
            time.sleep(wait)


class SchemaFilter:
    """Aceita só campos que existem no schema do core local (fixos ou dinâmicos)."""

    def __init__(self, solr):
        fields = http_json(f"{solr}/schema/fields?wt=json")["fields"]
        dyn = http_json(f"{solr}/schema/dynamicfields?wt=json")["dynamicFields"]
        # destinos de copyField são preenchidos pelo próprio Solr: reenviar duplica valores
        copy_dests = {c["dest"] for c in http_json(f"{solr}/schema/copyfields?wt=json")["copyFields"]}
        self.fixed = {f["name"] for f in fields} - {"_version_"} - copy_dests
        self.copy_dest_patterns = [
            re.compile("^" + re.escape(d).replace(r"\*", ".*") + "$") for d in copy_dests if "*" in d
        ]
        self.patterns = [re.compile("^" + re.escape(d["name"]).replace(r"\*", ".*") + "$") for d in dyn]
        self.dropped = {}

    def accepts(self, name):
        if any(p.match(name) for p in self.copy_dest_patterns):
            return False
        return name in self.fixed or any(p.match(name) for p in self.patterns)

    def clean(self, doc):
        out = {}
        for key, value in doc.items():
            if self.accepts(key):
                out[key] = value
            else:
                self.dropped[key] = self.dropped.get(key, 0) + 1
        return out


def search(api, params):
    query = urllib.parse.urlencode(params, doseq=True)
    return http_json(f"{api}/search?{query}")


def facet_values(api, field):
    data = search(api, {"lookfor": "", "type": "AllFields", "limit": 0,
                        "facet[]": field, "facetLimit": -1})
    return [(f["value"], f["count"]) for f in data.get("facets", {}).get(field, [])]


def harvest(api, solr, flt, extra_filter, max_docs, page_size, pause, label):
    page, sent = 1, 0
    while True:
        params = {"lookfor": "", "type": "AllFields", "limit": page_size, "page": page,
                  "sort": "relevance", "field[]": ["rawData"]}
        if extra_filter:
            params["filter[]"] = extra_filter
        data = search(api, params)
        records = data.get("records", [])
        if not records:
            break
        docs = [flt.clean(r["rawData"]) for r in records if r.get("rawData")]
        http_json(f"{solr}/update?commitWithin=60000&wt=json", docs)
        sent += len(docs)
        total = data.get("resultCount", 0)
        print(f"  {label}: {sent}/{min(total, max_docs or total)}", flush=True)
        if (max_docs and sent >= max_docs) or sent >= total:
            break
        page += 1
        time.sleep(pause)
    return sent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="https://bdtd.ibict.br/vufind/api/v1")
    ap.add_argument("--solr", default="http://localhost:8983/solr/biblio")
    ap.add_argument("--max", type=int, default=0, help="limite de documentos (0 = todos)")
    ap.add_argument("--page-size", type=int, default=100)
    ap.add_argument("--sleep", type=float, default=0.5)
    ap.add_argument("--by-facet", help="particiona a coleta por valores desta faceta")
    args = ap.parse_args()

    flt = SchemaFilter(args.solr)
    total = 0
    if args.by_facet:
        values = facet_values(args.api, args.by_facet)
        print(f"{len(values)} valores em {args.by_facet}")
        for value, count in values:
            fq = f'{args.by_facet}:"{value}"'
            total += harvest(args.api, args.solr, flt, fq, 0, args.page_size, args.sleep, value[:40])
            if args.max and total >= args.max:
                break
    else:
        total = harvest(args.api, args.solr, flt, None, args.max, args.page_size, args.sleep, "amostra")

    http_json(f"{args.solr}/update?commit=true&wt=json", {})
    print(f"\nEnviados: {total}")
    if flt.dropped:
        print("Campos descartados (não existem no schema local):")
        for name, n in sorted(flt.dropped.items(), key=lambda x: -x[1]):
            print(f"  {name}: {n}")


if __name__ == "__main__":
    main()
