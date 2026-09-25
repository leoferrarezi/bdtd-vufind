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
- Revisão de segurança do módulo e do tema (2026-09-25):
  - dARK ID com escape (era impresso cru, vindo dos metadados coletados); links de perfil
    Lattes e de acesso ao documento só com http/https; `rel="noopener"` nos links externos.
  - Bibliotecas JS e fontes servidas pelo tema, com versão fixa (vega 5.33.1, vega-lite 5.23.0,
    vega-embed 6.29.0, vega-interpreter 1.2.1, gridjs 6.2.0, tippy 6.3.7 com o Popper do bootstrap5; Open
    Sans/Roboto/Lato em `css/fonts`); nada vem de CDN nem do Google Fonts. Lista em
    `themes/bdtd/js/lib/VERSOES.md`.
  - axios 0.21.1 (com falhas conhecidas) substituído por `fetch`; parâmetros de URL codificados;
    dados de APIs montados com `textContent`/elementos em vez de `innerHTML`.
  - Gráficos do Vega com o interpretador de expressões (sem `eval`), preparando a CSP sem
    `unsafe-eval`.
  - Fallback da oasisbr-api: só IDs no formato da BDTD, URL http(s), suspensão de 60 s após
    falha (`suspend_after_failure` em `Apis.ini`).
  - Removidos: botão de exportação em massa (apontava para rota inexistente), template
    `link-source.phtml`, scripts e bibliotecas sem uso (DataTables, List.js, axios etc.).
  - Correções: exportação CSV das instituições (download via Blob; aspas e fórmulas tratadas),
    link "Documentos coletados" da fonte, aviso PHP a cada resultado (`getContainingCollections`),
    documentos da FAQ/Diretrizes (ofício e MTD3-BR, que davam 404) e links da FAQ que apontavam
    para a produção.
