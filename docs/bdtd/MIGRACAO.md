# Mapa da migração 7.1.1 → 11.1.0

Levantamento feito comparando o legado (tag `legacy-7.1.1`) com o VuFind 7.1.1 original
(tag `v7.1.1` do upstream): `git diff v7.1.1 legacy-7.1.1 --stat`.

Status: ⏳ pendente · 🔧 em andamento · ✅ feito · ⏸ adiado · 🗑 descartado

## Módulo `Bdtd`

| Legado | Destino no 11.1.0 | Status |
|---|---|---|
| 11 controllers de páginas (About, Faq, DataSources, Indicators, Participate, Tede, Participants, Network, Diretrizes, Technology) + rotas literais | Mantidos com as mesmas URLs e nomes de rota; base comum `AbstractPageController`; `?id=` do DataSources validado | ✅ testado na homologação |
| `RecordDriver\SolrDefault` (~40 métodos: orientadores, banca, Lattes, assuntos CNPq, resumos, DarkID…) | Estende `VuFind\RecordDriver\SolrDefault` do 11. Corrigidos: `getAbstractSpa` (legado tinha `getAbstracSpa`, resumo em espanhol nunca aparecia) e closure de `getSubjectsByField` | ✅ testado com amostra de 1.000 registros |
| `View\Helper\Root\RecordDataFormatterFactory` | `Bdtd\RecordDataFormatter\Specs\Bdtd` (plugin `recorddataformatter_specs`), escolhido pelo driver via `getRecordDataFormatterSpecClass()` | ✅ testado na homologação |
| `View\Helper\Root\Piwik` (Matomo LA Referencia) | `Bdtd\View\Helper\Root\Matomo` (única mudança real: envia `oaipmhID`, `repositoryID`, `countryID`); registro no `theme.config.php` do tema | ✅ registrado no theme.config.php (Matomo desligado na homologação) |
| `BulkExportController`, `BulkExportConfirm`, `ExecuteBulkExport` | Removidos do módulo (RCE/SSRF). Reescrita segura quando o serviço bulk-downloader estiver disponível; código original em `legacy-7.1.1` | ⏸ |
| `module.config.php.*.bak` | — | 🗑 |

## Edições de core no legado

| Arquivo do core editado | Intenção | Destino | Status |
|---|---|---|---|
| `Record/Loader.php` + `LoaderFactory.php` | Registro ausente no Solr → busca ID novo (`ids/`) ou backup (`records/`) na oasisbr-api | Ponto de extensão nativo `record_fallbackloader`: `Bdtd\Record\FallbackLoader\Solr` (Guzzle, timeout 5 s, falha silenciosa com log). URL em `local/config/vufind/Apis.ini` (vazia = desligado) | 🔧 portado, API desligada |
| `RecordDriver/DefaultRecord.php` | `getSource()` → `reponame_str` | Método no driver `Bdtd\RecordDriver\SolrDefault` | ✅ |
| `MetadataVocabulary/AbstractBase.php` + `DublinCore.php` | Meta tag `DC.description` (resumo) | **Já existe no VuFind 11** (via `getSummary`) — nada a fazer | ✅ |
| `Form/Form.php` | Assunto do e-mail = "assunto - nome" | Só config: formulário `FeedbackBdtd` em `local/config/vufind/FeedbackForms.yaml` (`emailSubject` com `%%value:subject%%`) | ✅ |
| `View/Helper/Root/Citation.php`, `Form.php` etc. | Apenas reformatação (sem mudança funcional) | — | 🗑 |
| `public/index.php` | Desafio JS antibot | `RateLimiter.yaml` nativo + fail2ban; desafio JS no módulo só se necessário | ⏳ (antes do go-live) |
| `themes/bootstrap3/js/*` | Reformatação automática em massa (sem mudança funcional) | — | 🗑 |
| `themes/bootstrap3/templates/*` (13 arquivos) | Quase tudo reformatação; `search/advanced/*` ganhou `:` nos rótulos e `div.adv-filters` | Descartado (sem efeito funcional) | 🗑 |

## Configuração (legado editava `config/vufind/` direto)

| Arquivo | Mudanças relevantes | Status |
|---|---|---|
| `config.ini` | tema `bdtd`, `sidebarOnLeft`, core Solr `biblio2`, PostgreSQL, e-mails BDTD, Matomo (`matomo.lareferencia.info`, `country_iso=BR`), captcha, comentários/listas/tags desligados, só pt-br/en/es | ✅ |
| `facets.ini` | Facetas `instname_str`, `network_name_str`, `dc.publisher.program.fl_str_mv`, orientador, `eu_rights_str_mv`, assuntos por/eng/CNPq; `collapsedFacets` | ✅ |
| `searches.ini` | `retain_filters_by_default=false`, busca por Resumo e Ano | ✅ (+ busca por Resumo com searchspecs) |
| `RecordTabs.ini` | Abas reduzidas | ✅ |
| `Search2.ini`, `permissions.ini` (API aberta), `NoILS.ini` (`mode=none`), `FeedbackForms.yaml`, `SearchApiRecordFields.yaml` (DarkID), `metadata.ini`, `contentsecuritypolicy.ini` | ver `git diff v7.1.1 legacy-7.1.1 -- config/` | ✅ (Search2 não é usado; não portado) |
| `Apis.ini` (URL da oasisbr-api), `bulkexport.ini` | Arquivos novos → `local/config/vufind/` | ✅ |

## Traduções

`languages/en.ini`, `es.ini`, `pt-br.ini`, `pt.ini` editados no legado → só as chaves BDTD em
`local/languages/*.ini` (o VuFind 11 mescla automaticamente sobre `languages/`; ~700 chaves por idioma extraídas por script). ✅

## Tema `bdtd` (51 templates no legado)

Base: estende `bootstrap5`. CSS legado (`style.css`, `custom.css`) carregado depois do
`compiled.css`; ajustes de compatibilidade só em `css/bdtd-bs5.css`.

| Grupo | Destino | Status |
|---|---|---|
| layout, header, footer, home, content-home, help | Reescritos sobre o bootstrap5; recursos externos em `config.ini [BdtdTheme]` | ✅ |
| searchbox, list-list, result-list, core, data-authors, cite, single-facet, advanced/layout | **Gerados** por `deploy/tools/tema/patchtpl.py` (original do VuFind 11 + regras em `deploy/tools/tema/regras/`) | ✅ |
| search/results | Reescrito sobre o bootstrap5 (faixa `result-header`, Exportar opcional) | ✅ |
| SideFacets, cluster-list, range-slider, facet-list, sort, toolbar, data-allSubjectHeadings, lightbox, record/view, ajuda de tag/geosearch | Descartados: viraram CSS/config ou eram só reformatação | 🗑 |
| 11 páginas institucionais + fontes de dados + ajuda | Convertidas (assetManager, breadcrumbs(), card, data-bs-*, ícones do tema) | ✅ |
| bulkexport/* | Removidos até a reescrita da exportação | ⏸ |
| Parciais novos | `search/bdtd-indicators.phtml`, `search/bdtd-shortcuts.phtml`, `RecordDriver/DefaultRecord/data-bdtd-plain.phtml` | ✅ |

Ícones: Unicons (CDN) e glyphicons trocados por aliases `bdtd-*` do FontAwesome 7 (já no
`compiled.css`); o nome de fonte `FontAwesome` usado pelo CSS legado foi apelidado para o
FontAwesome 7 em `bdtd-bs5.css`.

Correções de bugs do legado encontradas na migração:
- contadores da home quebravam se um formato não existisse no índice;
- `.card-results .link a { width: 10px }` passou a cortar "Acessar documento" no BS5;
- `evolution-indicators.js` / `load-network.js` quebravam sem a oasisbr-api (agora mostram aviso).

Pendências do tema: endurecer CSP (hoje `report_only`),
revisar mobile de todas as páginas institucionais. (Libs de CDN auto-hospedadas e DataTables
removido por falta de uso em 2026-09-25.)
