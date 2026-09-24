<?php

/**
 * Configuração do módulo Bdtd.
 *
 * Rotas e nomes de rota mantidos iguais ao legado 7.1.1 (links externos e
 * templates usam $this->url('about-home') etc.).
 */

namespace Bdtd\Module\Configuration;

use Laminas\Router\Http\Literal;

// Páginas institucionais: [nome da rota, caminho, controller, ação]
$pages = [
    ['about-home', '/about/home', 'About', 'Home'],
    ['faq-home', '/faq/home', 'Faq', 'Home'],
    ['datasources-home', '/datasources/home', 'DataSources', 'Home'],
    ['datasources-datasource', '/DataSources/Datasource', 'DataSources', 'Datasource'],
    ['indicators-home', '/indicators/home', 'Indicators', 'Home'],
    ['participate-home', '/Participate/Home', 'Participate', 'Home'],
    ['tede-home', '/Tede/Home', 'Tede', 'Home'],
    ['participants-home', '/Participants/Home', 'Participants', 'Home'],
    ['network-home', '/Network/Home', 'Network', 'Home'],
    ['diretrizes-home', '/Diretrizes/Home', 'Diretrizes', 'Home'],
    ['technology-home', '/Technology/Home', 'Technology', 'Home'],
];

$controllers = [
    'About', 'DataSources', 'Diretrizes', 'Faq', 'Indicators', 'Network',
    'Participants', 'Participate', 'Technology', 'Tede',
];

$config = [
    'controllers' => [
        'factories' => [],
        'aliases' => [],
    ],
    'router' => [
        'routes' => [],
    ],
    'vufind' => [
        'plugin_managers' => [
            'recorddriver' => [
                'factories' => [
                    \Bdtd\RecordDriver\SolrDefault::class => \VuFind\RecordDriver\SolrDefaultFactory::class,
                ],
                'aliases' => [
                    'solrdefault' => \Bdtd\RecordDriver\SolrDefault::class,
                    'SolrDefault' => \Bdtd\RecordDriver\SolrDefault::class,
                    \VuFind\RecordDriver\SolrDefault::class => \Bdtd\RecordDriver\SolrDefault::class,
                ],
            ],
            'recorddataformatter_specs' => [
                'factories' => [
                    \Bdtd\RecordDataFormatter\Specs\Bdtd::class
                        => \VuFind\RecordDataFormatter\Specs\DefaultRecordFactory::class,
                ],
            ],
            'record_fallbackloader' => [
                'factories' => [
                    \Bdtd\Record\FallbackLoader\Solr::class => \Bdtd\Record\FallbackLoader\SolrFactory::class,
                ],
                'aliases' => [
                    'solr' => \Bdtd\Record\FallbackLoader\Solr::class,
                    'Solr' => \Bdtd\Record\FallbackLoader\Solr::class,
                    \VuFind\Record\FallbackLoader\Solr::class => \Bdtd\Record\FallbackLoader\Solr::class,
                ],
            ],
        ],
    ],
];

foreach ($controllers as $name) {
    $class = "Bdtd\\Controller\\{$name}Controller";
    $config['controllers']['factories'][$class] = \VuFind\Controller\AbstractBaseFactory::class;
    $config['controllers']['aliases'][$name] = $class;
    $config['controllers']['aliases'][strtolower($name)] = $class;
}

foreach ($pages as [$routeName, $path, $controller, $action]) {
    $config['router']['routes'][$routeName] = [
        'type' => Literal::class,
        'options' => [
            'route' => $path,
            'defaults' => ['controller' => $controller, 'action' => $action],
        ],
    ];
}

return $config;
