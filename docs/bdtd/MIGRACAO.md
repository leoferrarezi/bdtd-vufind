# Mapa da migração 7.1.1 → 11.1.0

Levantamento feito comparando o legado (tag `legacy-7.1.1`) com o VuFind 7.1.1 original
(tag `v7.1.1` do upstream): `git diff v7.1.1 legacy-7.1.1 --stat`.

Status: ⏳ pendente · 🔧 em andamento · ✅ feito · ⏸ adiado · 🗑 descartado

## Módulo `Bdtd`

| Legado | Destino no 11.1.0 | Status |
|---|---|---|
| 11 controllers de páginas (About, Faq, DataSources, Indicators, Participate, Tede, Participants, Network, Diretrizes, Technology) + rotas literais | Mantidos com as mesmas URLs e nomes de rota; base comum `AbstractPageController`; `?id=` do DataSources validado | 🔧 portado, falta testar |
| `RecordDriver\SolrDefault` (~40 métodos: orientadores, banca, Lattes, assuntos CNPq, resumos, DarkID…) | Estende `VuFind\RecordDriver\SolrDefault` do 11. Corrigidos: `getAbstractSpa` (legado tinha `getAbstracSpa`, resumo em espanhol nunca aparecia) e closure de `getSubjectsByField` | 🔧 portado, falta testar com dados |
| `View\Helper\Root\RecordDataFormatterFactory` | `Bdtd\RecordDataFormatter\Specs\Bdtd` (plugin `recorddataformatter_specs`), escolhido pelo driver via `getRecordDataFormatterSpecClass()` | 🔧 portado, falta testar |
| `View\Helper\Root\Piwik` (Matomo LA Referencia) | `Bdtd\View\Helper\Root\Matomo` (única mudança real: envia `oaipmhID`, `repositoryID`, `countryID`); registro no `theme.config.php` do tema | 🔧 portado, falta registrar no tema |
| `BulkExportController`, `BulkExportConfirm`, `ExecuteBulkExport` | Removidos do módulo (RCE/SSRF). Reescrita segura quando o serviço bulk-downloader estiver disponível; código original em `legacy-7.1.1` | ⏸ |
| `module.config.php.*.bak` | — | 🗑 |

## Edições de core no legado

| Arquivo do core editado | Intenção | Destino | Status |
|---|---|---|---|
| `Record/Loader.php` + `LoaderFactory.php` | Registro ausente no Solr → busca ID novo (`ids/`) ou backup (`records/`) na oasisbr-api | Ponto de extensão nativo `record_fallbackloader`: `Bdtd\Record\FallbackLoader\Solr` (Guzzle, timeout 5 s, falha silenciosa com log). URL em `local/config/vufind/Apis.ini` (vazia = desligado) | 🔧 portado, API desligada |
| `RecordDriver/DefaultRecord.php` | `getSource()` → `reponame_str` | Método no driver `Bdtd\RecordDriver\SolrDefault` | ✅ |
| `MetadataVocabulary/AbstractBase.php` + `DublinCore.php` | Meta tag `DC.description` (resumo) | **Já existe no VuFind 11** (via `getSummary`) — nada a fazer | ✅ |
| `Form/Form.php` | Assunto do e-mail = "assunto - nome" | Só config: `FeedbackForms.yaml` com `%%subject%% - %%name%%` | ⏳ |
| `View/Helper/Root/Citation.php`, `Form.php` etc. | Apenas reformatação (sem mudança funcional) | — | 🗑 |
| `public/index.php` | Desafio JS antibot | `RateLimiter.yaml` nativo + fail2ban; desafio JS no módulo só se necessário | ⏳ |
| `themes/bootstrap3/js/*` | Reformatação automática em massa (sem mudança funcional) | — | 🗑 |
| `themes/bootstrap3/templates/*` (13 arquivos) | Quase tudo reformatação; `search/advanced/*` ganhou `:` nos rótulos e `div.adv-filters` | Avaliar no tema bdtd | ⏳ |

## Configuração (legado editava `config/vufind/` direto)

| Arquivo | Mudanças relevantes | Status |
|---|---|---|
| `config.ini` | tema `bdtd`, `sidebarOnLeft`, core Solr `biblio2`, PostgreSQL, e-mails BDTD, Matomo (`matomo.lareferencia.info`, `country_iso=BR`), captcha, comentários/listas/tags desligados, só pt-br/en/es | ⏳ |
| `facets.ini` | Facetas `instname_str`, `network_name_str`, `dc.publisher.program.fl_str_mv`, orientador, `eu_rights_str_mv`, assuntos por/eng/CNPq; `collapsedFacets` | ⏳ |
| `searches.ini` | `retain_filters_by_default=false`, busca por Resumo e Ano | ⏳ |
| `RecordTabs.ini` | Abas reduzidas | ⏳ |
| `Search2.ini`, `permissions.ini` (API aberta), `NoILS.ini` (`mode=none`), `FeedbackForms.yaml`, `SearchApiRecordFields.yaml` (DarkID), `metadata.ini`, `contentsecuritypolicy.ini` | ver `git diff v7.1.1 legacy-7.1.1 -- config/` | ⏳ |
| `Apis.ini` (URL da oasisbr-api), `bulkexport.ini` | Arquivos novos → `local/config/vufind/` | ⏳ |

## Traduções

`languages/en.ini`, `es.ini`, `pt-br.ini`, `pt.ini` editados no legado → só as chaves BDTD em
`local/languages/*.ini` com `@parent_ini`. ⏳

## Tema `bdtd` (51 templates)

- 18 templates novos (páginas de conteúdo, bulkexport, `access-level`, `dark-id`, `link-source`) → converter classes Bootstrap 3 → 5.
- 33 overrides de templates do core → merge de 3 vias: `v7.1.1:themes/bootstrap3/...` (base) →
  `legacy-7.1.1:themes/bdtd/...` (intenção) → `v11.1.0:themes/bootstrap5/...` (novo).
- JS: URL da API vem do config; DataTables BS5; revisar axios/vega/gridjs/wordcloud2.
- Terceiros: Google Tag (`G-HDE70XCBE2`), UserWay, barra.brasil.gov.br → CSP com nonce.

Status geral do tema: ⏳
