# BDTD sobre VuFind 11 — documentação do projeto

Este repositório é o VuFind oficial (tag `v11.1.0`, remote `upstream`) com as customizações da
BDTD (Biblioteca Digital Brasileira de Teses e Dissertações — IBICT) isoladas em:

| Onde | O quê |
|---|---|
| `module/Bdtd/` | Módulo Laminas: páginas institucionais, driver de registro, loader com fallback na oasisbr-api, exportação em massa |
| `themes/bdtd/` | Tema (estende `bootstrap5`) |
| `local/config/vufind/` | Somente as configurações que diferem do padrão |
| `local/languages/` | Traduções específicas da BDTD |
| `deploy/` | Scripts idempotentes de provisionamento e deploy da VPS |
| `docs/bdtd/` | Esta documentação |

**Regra de ouro:** nenhum arquivo do core do VuFind é editado. Se algo exigir alteração de core,
registrar em [DECISOES.md](DECISOES.md) antes.

## Documentos

- [RUNBOOK.md](RUNBOOK.md) — passo a passo exato para reconstruir tudo do zero (máquina local e VPS).
- [MIGRACAO.md](MIGRACAO.md) — mapa de cada customização do 7.1.1 e onde ela ficou no 11.1.0.
- [DECISOES.md](DECISOES.md) — decisões tomadas e o porquê.
- [CHANGELOG.md](CHANGELOG.md) — o que mudou em cada tag `bdtd-*`.

## Branches e tags

- `main` — código legado (VuFind 7.1.1) mantido pelo IBICT até o go-live.
- `legacy-7.1.1` (tag) / `legacy/7.1.1` (branch) — snapshot do legado antes da migração.
- `vufind11` — trabalho da migração (base `v11.1.0`).
- Atualizar o VuFind: `git fetch upstream --tags && git merge v11.x.y` na branch de trabalho.
