<?php

/**
 * Factory do fallback de registros via oasisbr-api.
 *
 * PHP version 8
 *
 * @category BDTD
 * @package  Record
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */

namespace Bdtd\Record\FallbackLoader;

use Psr\Container\ContainerInterface;

/**
 * Lê a URL da API em Apis.ini ([Oasisbr] oasisbr_api, timeout).
 *
 * @category BDTD
 * @package  Record
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
class SolrFactory extends \VuFind\Record\FallbackLoader\SolrFactory
{
    /**
     * Create an object
     *
     * @param ContainerInterface $container     Service manager
     * @param string             $requestedName Service being created
     * @param null|array         $options       Extra options (optional)
     *
     * @return object
     */
    public function __invoke(
        ContainerInterface $container,
        $requestedName,
        ?array $options = null
    ) {
        if (!empty($options)) {
            throw new \Exception('Unexpected options passed to factory.');
        }
        $apis = $container->get(\VuFind\Config\ConfigManagerInterface::class)->getConfigArray('Apis');
        $loader = parent::__invoke(
            $container,
            $requestedName,
            [
                $container->get(\VuFind\Http\GuzzleService::class),
                $container->get(\VuFind\RecordDriver\PluginManager::class),
                (string)($apis['Oasisbr']['oasisbr_api'] ?? ''),
                (float)($apis['Oasisbr']['timeout'] ?? 5),
            ]
        );
        $loader->setLogger($container->get(\VuFind\Log\Logger::class));
        return $loader;
    }
}
