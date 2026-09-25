# Bibliotecas de terceiros do tema bdtd

Servidas pelo próprio site: nenhum script ou fonte do tema vem de CDN.
Motivos: o código de terceiros não muda sem passar pelo git, o site não
depende da disponibilidade do CDN, o IP do visitante não vai para terceiros
e a CSP pode ficar em `script-src 'self'`.

Para atualizar: baixar a versão nova do mesmo caminho, trocar o arquivo,
atualizar esta tabela (versão e sha256) e testar as páginas que usam.

| Arquivo | Pacote npm | Versão | Licença | Usado em | Origem |
|---|---|---|---|---|---|
| js/lib/vega.min.js | vega | 5.33.1 | BSD-3-Clause | indicadores | https://cdn.jsdelivr.net/npm/vega@5.33.1/build/vega.min.js |
| js/lib/vega-lite.min.js | vega-lite | 5.23.0 | BSD-3-Clause | indicadores | https://cdn.jsdelivr.net/npm/vega-lite@5.23.0/build/vega-lite.min.js |
| js/lib/vega-embed.min.js | vega-embed | 6.29.0 | BSD-3-Clause | indicadores | https://cdn.jsdelivr.net/npm/vega-embed@6.29.0/build/vega-embed.min.js |
| js/lib/vega-interpreter.min.js | vega-interpreter | 1.2.1 | BSD-3-Clause | indicadores (Vega sem eval) | https://cdn.jsdelivr.net/npm/vega-interpreter@1.2.1/build/vega-interpreter.min.js |
| js/lib/tippy-bundle.umd.min.js | tippy.js | 6.3.7 | MIT | indicadores (nuvem de palavras; usa o Popper do bootstrap5) | https://cdn.jsdelivr.net/npm/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js |
| js/lib/gridjs.umd.js | gridjs | 6.2.0 | MIT | instituições participantes | https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/gridjs.umd.js |
| css/gridjs-mermaid.min.css | gridjs | 6.2.0 | MIT | instituições participantes | https://cdn.jsdelivr.net/npm/gridjs@6.2.0/dist/theme/mermaid.min.css |
| js/lib/wordcloud2.js | wordcloud2 | (do legado) | MIT | indicadores | https://github.com/timdream/wordcloud2.js |
| css/fonts/*.woff2 | Open Sans, Roboto, Lato | Google Fonts (set/2026) | SIL OFL 1.1 | todas as páginas (css/bdtd-fonts.css) | https://fonts.googleapis.com/css2 |

Removidas na revisão de 2026-09-25: axios 0.21.1 (substituído por `fetch`),
DataTables, List.js e scripts sem uso (accessibility.js, datasource.js,
open-close-tab.js, languages/*.js).

## sha256
```
463f3db6a40b20e9747b4ed38f37ed0add508838f9141b1cf8366784b07b30c8  js/lib/vega.min.js
58c27358e26f2d319cf62f45bc17a4c8362f08645001df2ec8d341eee4097c7f  js/lib/vega-lite.min.js
12d02acfbe3ec59ef9a37dd4822a2e04e2961b5bbb671bbe661d2221715b99da  js/lib/vega-embed.min.js
ee191cf04168e0c043214cea7c4e5ef80e908daa0e757c19c8061df5f898cf89  js/lib/vega-interpreter.min.js
3f0fe70eb26ccf28f6887a192e29d38dd7ef7c2f079a73304ad42ddc7bed37de  js/lib/tippy-bundle.umd.min.js
f7402f347715568c73f061781edd8e7dceeecdd7e2503c28a1012b7ccbc12509  js/lib/gridjs.umd.js
ab9585e3983a57267a8f22f708fe40ad70f8c1bd5688ebfba31d11a0c7cca331  css/gridjs-mermaid.min.css
bb323e5d036e95ac1823d607414ebcae88d83c6c2eff78e6472754575193236d  js/lib/wordcloud2.js
8b9fc9737043f88c1a9a7195c27a239bd329cc33d928ffb67736c61ae7a1dbbd  css/fonts/lato-latin-ext.woff2
918b7dc3e2e2d015c16ce08b57bcb64d2253bafc1707658f361e72865498e537  css/fonts/lato-latin.woff2
d5bab8e28732fe3d10dcef4f77b9c248605bbb2a87d289a2539251ceafab536a  css/fonts/open-sans-latin-ext.woff2
d8e4fe0452aa2076429a9bb5d8757d00a994dd95986cf950e9a1a371b9a072a0  css/fonts/open-sans-latin.woff2
5725eacca97303d8bce26f76cfcaee4393295bbf93c1eb6c3e5e4f260b2da189  css/fonts/roboto-latin-ext.woff2
425c0713a8176f92273d378599c7eac57de7fafabd4bd0ed457b70eb8f80d371  css/fonts/roboto-latin.woff2
```
