<?php
return [
    'extends' => 'bootstrap3',
    'css' => [
        'style.css',
        'custom.css',
        'datatables.min.css',
        'dataTables.bootstrap.min.css',
    ],
    'js' => [
        'languages.js',
        'format.js',
        'base.js',
        'lib/axios.min.js',
    ],
    'favicon' => 'icons/favicon.ico',
    'helpers' => ['factories' => [
        'VuFind\View\Helper\Root\RecordDataFormatter' => 'Bdtd\View\Helper\Root\RecordDataFormatterFactory',
    ]],
    'aliases' => [
        'piwik' => 'Bdtd\View\Helper\Root\Piwik',
    ]

];
