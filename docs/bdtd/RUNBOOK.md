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

_A preencher._

## 3. VPS (Ubuntu 24.04)

Acesso: `ssh -i ~/.ssh/id_ed25519_bdtd_vps -p 10020 leoferrarezi@103.14.27.53`
(NAT: 10020 → 22, 10080 → 80). O usuário precisa de sudo sem senha durante o provisionamento.

_A preencher._
