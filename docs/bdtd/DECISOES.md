# Decisões

Formato: data — decisão — motivo.

## 2026-09-24

1. **Base = tag oficial `v11.1.0` com histórico do upstream.** Permite atualizar com `git merge` de
   tags futuras. A pasta de referência `vufind-bdtd-main` era snapshot da branch `dev` (47 arquivos
   diferentes da tag) — descartada para produção.
2. **Legado preservado sem reescrever `main`.** Tag `legacy-7.1.1` + branch `legacy/7.1.1`; trabalho na
   branch `vufind11`. A troca da `main` só no go-live, com aval do responsável.
3. **Nenhuma edição de core.** No legado havia edições em `Record/Loader.php`, `LoaderFactory.php`,
   `DefaultRecord.php`, `MetadataVocabulary/*`, `Form/Form.php`, `public/index.php` e em
   `config/vufind/*.ini`. Todas passam para o módulo, o tema ou `local/` (ver MIGRACAO.md).
4. **Configurações locais versionadas; segredos fora do git.** O VuFind 11 suporta
   `database_password_file`, `recaptcha_secretKey_file` etc. Segredos ficam em
   `/etc/bdtd/secrets/` na VPS (permissão 640, grupo `www-data`).
5. **Banco PostgreSQL** (paridade com a produção atual).
6. **Exportação em massa será reescrita**, não portada: o código legado tinha execução remota de
   comandos (`exec()` com parâmetros do usuário) e SSRF (`/bulkexport/download?url=`).
7. **Integrações com a oasisbr-api ficam para depois**: disponibilidade/dados da API ainda não
   confirmados. O código é portado com a URL configurável e degradação silenciosa se a API falhar.
8. **Homologação sem domínio:** acesso por `http://103.14.27.53:18080/` (NAT 18080 → 80). Sem HTTPS
   por enquanto (Let's Encrypt exige domínio). Site com `noindex` até o go-live.
9. **Solr reindexado, não copiado:** índice Lucene 7 não abre no Solr 9. Os campos BDTD
   (`dc.*.fl_str_mv`, `instname_str`, …) são cobertos pelos dynamicFields do schema padrão.
10. **Porta pública 18080** (NAT 18080 → 80). A 10080 foi descartada: navegadores a bloqueiam
    ("unsafe port", ERR_UNSAFE_PORT).
11. **Dados da homologação vêm da API pública da produção** (`/vufind/api/v1/search` com
    `field[]=rawData`), porque o Solr informado (`testesolr7.ibict.br`) responde 404. Importador:
    `deploy/tools/import_from_api.py`. A API de produção só pagina até ~1.000 resultados por
    consulta; a carga completa precisa particionar (instituição × ano). Carga completa só com
    aval do responsável (gera ~11.500 requisições na produção).
12. **Tema: CSS legado preservado, correções à parte.** `style.css`/`custom.css` ficam iguais ao
    legado; tudo o que a migração precisou mudar está em `bdtd-bs5.css`, comentado.
13. **Templates "original + mudanças" são gerados** por `deploy/tools/tema/patchtpl.py` a partir
    de regras. Ao atualizar o VuFind: `VUFIND_TAG=vX.Y.Z python deploy/tools/tema/patchtpl.py
    deploy/tools/tema/regras/*.py` e revisar o diff.
14. **Recursos de terceiros desligados na homologação** (`[BdtdTheme]`, `[GoogleAnalytics]`,
    `[Matomo]`): não contaminar estatísticas da produção nem carregar scripts externos.
15. **Seletor de idioma visível no menu** (na produção atual ele não aparece). Há traduções
    pt-br/en/es. Reverter é uma linha no `header.phtml` se o IBICT preferir.
16. **oasisbr-api fora do ar** (503 em 2026-09-24). Front-end e fallback de registros degradam
    sem erro; reativar = preencher `oasisbr_api` em `local/config/vufind/Apis.ini`.
