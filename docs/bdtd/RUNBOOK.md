# Runbook — reconstruir o BDTD (VuFind 11) do zero

Cada seção lista os comandos exatos na ordem em que foram executados. Quando um passo virar
script em `deploy/`, o runbook aponta para o script.

## 1. Repositório (feito em 2026-09-24)

```bash
git clone https://github.com/leoferrarezi/bdtd-vufind.git
cd bdtd-vufind
git remote add upstream https://github.com/vufind-org/vufind.git
git fetch upstream refs/tags/v11.1.0:refs/tags/v11.1.0 refs/tags/v7.1.1:refs/tags/v7.1.1 --no-tags

# preservar o legado (main = VuFind 7.1.1 do IBICT)
git tag -a legacy-7.1.1 main -m "Estado do BDTD em VuFind 7.1.1 antes da migração para 11.1.0"
git branch legacy/7.1.1 main

# branch de trabalho a partir do VuFind oficial
git switch -c vufind11 v11.1.0
git push origin legacy-7.1.1 legacy/7.1.1 vufind11
```

Ajustes de repositório na branch `vufind11`:
- `.gitattributes`: `*.sh` e `deploy/**` com `eol=lf` (o Windows usa `core.autocrlf=true`).
- `.gitignore`: removido o ignore de `local/config/vufind/*` (configs locais são versionadas).

Levantar as diferenças do legado a qualquer momento:
```bash
git diff --stat v7.1.1 legacy-7.1.1
git diff v7.1.1 legacy-7.1.1 -- config/vufind/facets.ini
```

## 2. Ambiente local (Windows + Laragon)

Até aqui o desenvolvimento foi feito editando no Windows e publicando na VPS de homologação
(`deploy.sh`), sem ambiente local rodando. Para montar um local, ver pendências no fim.

## 2.1 Tema bdtd — como foi portado (e como refazer)

1. `themes/bdtd/theme.config.php`: `extends => bootstrap5`; CSS sem `priority` (senão sai
   antes do `compiled.css` e é anulado); ícones `bdtd-*`; helper Matomo.
2. Templates reescritos à mão: `layout/layout.phtml`, `layout/help.phtml`, `header.phtml`,
   `footer.phtml`, `search/home.phtml`, `content-home.phtml`, `search/results.phtml` e os
   parciais `search/bdtd-*.phtml`, `RecordDriver/DefaultRecord/data-bdtd-plain.phtml`.
3. Templates gerados (original do VuFind + regras):
   ```bash
   python deploy/tools/tema/patchtpl.py deploy/tools/tema/regras/*.py
   git status themes   # sem diferenças = regras e templates em sincronia
   ```
4. Páginas institucionais: conversão BS3→BS5 por substituição (`headScript`→`assetManager`,
   `layout()->breadcrumbs .=`→`breadcrumbs()->add()`, `panel`→`card`, `data-toggle`→`data-bs-toggle`,
   glyphicons→`$this->icon('bdtd-*')`).
5. Traduções: `local/languages/{pt-br,en,es}.ini` = chaves que o legado mudou/criou em relação
   ao 7.1.1 original e que o VuFind 11 não traduz igual (extraídas por script; ver commit).
6. Validação: comparar lado a lado com https://bdtd.ibict.br/vufind/ (home, resultados,
   registro, busca avançada, páginas institucionais), desktop e celular, e console sem erros.

## 3. VPS (Ubuntu 24.04)

Acesso: `ssh -i ~/.ssh/id_ed25519_bdtd_vps -p 10020 leoferrarezi@103.14.27.53`
(NAT: 10020 → 22, 18080 → 80). IP interno da VPS: 10.10.10.7. Hostname `bdtd`.
Recursos: 4 vCPU, 15 GB RAM, disco 80 GB.

### 3.1 Acesso (feito em 2026-09-24)

Na máquina local (Windows/Git Bash), chave dedicada ao projeto:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_bdtd_vps -N "" -C "claude-bdtd-vps (leoferrarezi@gmail.com)"
```
Na VPS, como `leoferrarezi` (feito pelo responsável):
```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo '<conteúdo de id_ed25519_bdtd_vps.pub>' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
echo 'leoferrarezi ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/90-leoferrarezi && sudo chmod 440 /etc/sudoers.d/90-leoferrarezi
```

### 3.2 Expandir o disco (feito em 2026-09-24)

O instalador do Ubuntu deixou a raiz com 24 GB num disco de 80 GB (metade do PV livre no LVM e ~30 GB
sem partição). Expansão online, sem perda de dados:
```bash
sudo apt-get install -y cloud-guest-utils
sudo growpart /dev/sda 3
sudo pvresize /dev/sda3
sudo lvextend -r -l +100%FREE /dev/ubuntu-vg/ubuntu-lv   # -r já faz o resize2fs
df -h /    # → 77G
```

### 3.3 Provisionamento

```bash
curl -fsSL https://raw.githubusercontent.com/leoferrarezi/bdtd-vufind/vufind11/deploy/provision.sh -o /tmp/provision.sh
sudo env LOCAL_MODULES=Bdtd bash /tmp/provision.sh > /tmp/provision.log 2>&1
```
O script é idempotente: para aplicar mudanças de `deploy/` depois, basta rodá-lo de novo.

Resultado (2026-09-24): Apache, PHP-FPM 8.3, PostgreSQL 16 e Solr 9.8.1 ativos; Solr e Postgres
escutando só em 127.0.0.1; ufw liberando 22/80/443.

Problema encontrado e corrigido: erro 500 `Undefined constant PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT`.
Causa: `[Database]` do config.ini local era mesclada com a do pai, e o `database = mysql://...` do
pai tem prioridade sobre `database_driver` etc. Solução: `override_full_sections = "Languages,Database"`.

### 3.3.1 Dados (amostra) no Solr

```bash
python3 /opt/bdtd/deploy/tools/import_from_api.py --max 5000     # amostra (~1.000 únicos)
curl -s 'http://localhost:8983/solr/biblio/select?q=*:*&rows=0'  # conferir numFound
```
O importador descarta campos que o schema local não aceita e os destinos de `copyField`
(`spellingShingle`, `title_fullStr`, `title_full_unstemmed`, `author_facet`, `_version_`),
que o próprio Solr regenera. Carga completa: `--by-facet instname_str` (precisa de
particionamento extra por ano para instituições com mais de 1.000 registros).

### 3.4 Deploy de rotina

```bash
sudo bash /opt/bdtd/deploy/deploy.sh             # último commit da branch vufind11
sudo bash /opt/bdtd/deploy/deploy.sh <tag>       # versão específica / rollback
```
Logs: `/var/log/bdtd/` (`vufind.log`, `apache-error.log`, `apache-access.log`, `cron.log`).

### 3.5 Acesso público

`http://103.14.27.53:18080/vufind/` — NAT 18080 → 10.10.10.7:80 no roteador/provedor.

A porta 10080 foi usada primeiro, mas **navegadores bloqueiam a 10080** (lista de "unsafe ports",
erro ERR_UNSAFE_PORT); por isso a troca para 18080. Ao mudar a porta, atualizar `url` em
`local/config/vufind/config.ini`.

Alternativa sem NAT (túnel SSH):
```bash
ssh -i ~/.ssh/id_ed25519_bdtd_vps -p 10020 -L 8080:localhost:80 leoferrarezi@103.14.27.53
# navegador: http://localhost:8080/vufind/
```
