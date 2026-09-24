<?php

/**
 * Rastreamento Matomo da BDTD (instância da LA Referencia).
 *
 * PHP version 8
 *
 * @category BDTD
 * @package  View_Helpers
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */

namespace Bdtd\View\Helper\Root;

use VuFind\RecordDriver\AbstractBase as RecordDriverBase;

/**
 * Substitui o helper Piwik do legado. Acrescenta aos dados de registro os campos
 * que a LA Referencia usa para atribuir acessos a cada repositório:
 * oaipmhID, repositoryID e countryID (config.ini [Matomo] country_iso).
 *
 * Os campos só são enviados se mapeados em [Matomo] custom_dimensions[...] ou
 * com custom_variables = true, como os demais dados customizados do VuFind.
 *
 * @category BDTD
 * @package  View_Helpers
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
class Matomo extends \VuFind\View\Helper\Root\Matomo
{
    /**
     * Código ISO do país (ex.: BR).
     *
     * @var string
     */
    protected string $countryIso;

    /**
     * Constructor
     *
     * @param \VuFind\Config\Config                $config  VuFind configuration
     * @param \Laminas\Router\Http\TreeRouteStack  $router  Router
     * @param \Laminas\Http\PhpEnvironment\Request $request Request
     */
    public function __construct(
        \VuFind\Config\Config $config,
        \Laminas\Router\Http\TreeRouteStack $router,
        \Laminas\Http\PhpEnvironment\Request $request
    ) {
        parent::__construct($config, $router, $request);
        $this->countryIso = (string)($config->Matomo->country_iso ?? '');
    }

    /**
     * Dados customizados da página de registro.
     *
     * @param RecordDriverBase $recordDriver Registro
     *
     * @return array
     */
    protected function getRecordPageCustomData(RecordDriverBase $recordDriver): array
    {
        return parent::getRecordPageCustomData($recordDriver) + [
            'oaipmhID' => (string)$recordDriver->tryMethod('getIdentifierOAI'),
            'repositoryID' => (string)$recordDriver->tryMethod('getRepositoryID'),
            'countryID' => $this->countryIso,
        ];
    }
}
