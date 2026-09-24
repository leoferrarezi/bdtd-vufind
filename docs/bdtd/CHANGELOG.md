# Changelog BDTD

## Não lançado (branch `vufind11`)

- Estrutura do repositório: base VuFind 11.1.0, documentação em `docs/bdtd/`, configs locais versionadas.
- Importação do módulo `Bdtd` e do tema `bdtd` do legado 7.1.1 (sem alterações), para a migração
  aparecer como diff nos commits seguintes.
- Módulo `Bdtd` portado (driver, campos do registro, Matomo, fallback oasisbr-api); exportação
  em massa removida até reescrita segura.
- Configurações locais (facetas, buscas + busca por Resumo, formulário de contato, registro
  oculto, sem abas, e-mail/SMS desligados, logging, fuso) e traduções próprias.
- Tema `bdtd` em Bootstrap 5: todas as páginas do legado, validadas contra a produção.
- VPS: provisionamento, deploy, importador de dados via API pública.
