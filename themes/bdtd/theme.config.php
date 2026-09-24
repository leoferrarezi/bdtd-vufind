<?php

/**
 * Tema da BDTD para VuFind 11 (Bootstrap 5).
 *
 * Portado do tema legado (bootstrap3). O CSS próprio do site (style.css,
 * compilado de scss/style.scss, e custom.css) é carregado DEPOIS do
 * compiled.css do bootstrap5; bdtd-bs5.css traz os ajustes da migração.
 * DataTables e scripts de gráficos são carregados só nas páginas que usam.
 * Recursos externos (Google Analytics, UserWay, barra do governo, Google
 * Tradutor) são ligados/desligados em config.ini [BdtdTheme].
 */
return [
    'extends' => 'bootstrap5',
    'css' => [
        ['file' => 'style.css', 'priority' => 900],
        ['file' => 'custom.css', 'priority' => 910],
        ['file' => 'bdtd-bs5.css', 'priority' => 920],
    ],
    'js' => [
        ['file' => 'languages.js', 'priority' => 900],
        ['file' => 'format.js', 'priority' => 910],
        ['file' => 'lib/axios.min.js', 'priority' => 920],
        ['file' => 'base.js', 'priority' => 930],
    ],
    'favicon' => [
        ['href' => 'icons/favicon.ico', 'rel' => 'icon', 'sizes' => 'any'],
        ['href' => 'icons/favicon-32x32.png', 'rel' => 'icon', 'type' => 'image/png', 'sizes' => '32x32'],
        ['href' => 'icons/favicon-16x16.png', 'rel' => 'icon', 'type' => 'image/png', 'sizes' => '16x16'],
        ['href' => 'icons/apple-touch-icon.png', 'rel' => 'apple-touch-icon', 'type' => 'image/png', 'sizes' => '180x180'],
    ],
    // Ícones do tema (substituem os Unicons/glyphicons/FontAwesome 4 do legado).
    // Uso: $this->icon('bdtd-home'). FontAwesome 7 já vem no compiled.css do bootstrap5.
    'icons' => [
        'aliases' => [
            'bdtd-home' => 'FontAwesome:house',
            'bdtd-translate' => 'FontAwesome:language',
            'bdtd-institutions' => 'FontAwesome:building-columns',
            'bdtd-dissertations' => 'FontAwesome:clipboard fa-regular',
            'bdtd-theses' => 'FontAwesome:book-open',
            'bdtd-documents' => 'FontAwesome:file-lines fa-regular',
            'bdtd-participate' => 'FontAwesome:comment-dots fa-regular',
            'bdtd-technology' => 'FontAwesome:globe',
            'bdtd-indicators' => 'FontAwesome:chart-line',
            'bdtd-author' => 'FontAwesome:pen',
            'bdtd-advanced' => 'FontAwesome:circle-plus',
            'bdtd-link' => 'FontAwesome:link',
            'bdtd-download' => 'FontAwesome:download',
            'bdtd-database' => 'FontAwesome:database',
        ],
    ],
    'helpers' => [
        'factories' => [
            \Bdtd\View\Helper\Root\Matomo::class => \VuFind\View\Helper\Root\MatomoFactory::class,
        ],
        'aliases' => [
            'matomo' => \Bdtd\View\Helper\Root\Matomo::class,
        ],
    ],
];
