"""Gera templates do tema bdtd a partir dos originais do VuFind + substituições.

Por que existe: vários templates do tema são "original do VuFind + poucas mudanças da BDTD".
Guardar as mudanças como regras (deploy/tools/tema/regras/*.py) permite, ao atualizar o
VuFind, regerar os templates a partir da versão nova. Se o original mudou onde a BDTD
altera, o script para e diz qual trecho não foi encontrado.

Uso (na raiz do repositório):
  python deploy/tools/tema/patchtpl.py deploy/tools/tema/regras/*.py
  VUFIND_TAG=v11.2.0 python deploy/tools/tema/patchtpl.py deploy/tools/tema/regras/*.py
Cada arquivo de regras define:
  SRC  = 'themes/bootstrap5/templates/...'   (caminho na tag v11.1.0)
  DEST = 'themes/bdtd/templates/...'
  REPL = [(antigo, novo), (antigo, novo, "all"), between(inicio, fim, novo), ...]
Cada trecho/marcador precisa existir exatamente uma vez (salvo "all"); senão o script para.
"""
import io
import os
import subprocess
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TAG = os.environ.get("VUFIND_TAG", "v11.1.0")


def between(start, end, new):
    """Substitui do início de `start` até o fim de `end` (a partir de start)."""
    def apply(src):
        if src.count(start) != 1:
            sys.exit(f"ERRO: marcador inicial encontrado {src.count(start)} vezes: {start[:80]!r}")
        i = src.index(start)
        j = src.find(end, i)
        if j < 0:
            sys.exit(f"ERRO: marcador final não encontrado: {end[:80]!r}")
        return src[:i] + new + src[j + len(end):]
    return apply


for rules_file in sys.argv[1:]:
    rules = {"between": between}
    exec(io.open(rules_file, encoding="utf-8").read(), rules)
    src = subprocess.run(
        ["git", "-C", REPO, "show", f"{TAG}:{rules['SRC']}"], capture_output=True, check=True
    ).stdout.decode("utf-8")
    for item in rules["REPL"]:
        if callable(item):
            src = item(src)
            continue
        old, new = item[0], item[1]
        n = src.count(old)
        if len(item) > 2 and item[2] == "all":  # substituir todas as ocorrências (>= 1)
            if n < 1:
                sys.exit(f"ERRO ({rules_file}): trecho não encontrado: {old[:80]!r}")
            src = src.replace(old, new)
            continue
        if n != 1:
            sys.exit(f"ERRO ({rules_file}): trecho encontrado {n} vezes: {old[:80]!r}")
        src = src.replace(old, new)
    dest = os.path.join(REPO, *rules["DEST"].split("/"))
    io.open(dest, "w", encoding="utf-8", newline="\n").write(src)
    print("ok:", rules["DEST"])
