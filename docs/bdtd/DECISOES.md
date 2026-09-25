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
17. **Camada local só do servidor** (`/etc/bdtd/local`, herda `/opt/bdtd/local` via
    `DirLocations.ini`): lugar dos segredos que o VuFind não lê de arquivo (ex.:
    `ils_encryption_key`). Gerada pelo `provision.sh`, nunca versionada.
18. **Solr local, não o remoto do roteiro.** O roteiro do IBICT aponta o VuFind direto para
    `https://testesolr7.ibict.br/solr/`; aqui responde 404. Se o IBICT liberar o acesso (IP da VPS:
    103.14.27.53), dá para apontar `[Index] url` para ele e dispensar a carga de dados — mas o
    índice é Solr 7 e precisa ser testado com o VuFind 11.
19. **Assistente /vufind/Install desligado** após a conferência (`autoConfigure = false`).
20. **Nada de CDN no tema.** Scripts de terceiros e fontes ficam no repositório, com versão fixa e
    sha256 em `themes/bdtd/js/lib/VERSOES.md`. Código de terceiros só muda por commit, o site não
    depende do CDN, o IP do visitante não vai para o Google/jsDelivr/unpkg (LGPD) e a CSP pode
    ser `'self'`. Atualizar = trocar o arquivo, a tabela e testar a página.
21. **Dados externos nunca viram HTML.** Metadados coletados (dARK, Lattes, URLs) e respostas de
    APIs (oasisbr-api, API do VuFind) são escapados nos templates e montados com
    `textContent`/elementos no JS; links só com http/https.
22. **Botão de exportação em massa retirado** do tema (e a opção `bulk_export`) até existir a
    exportação reescrita; a do legado tinha execução de comandos e proxy aberto.
