<?php

/**
 * Módulo de customizações da BDTD.
 *
 * PHP version 8
 *
 * @category BDTD
 * @package  Module
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */

namespace Bdtd;

/**
 * Carregado via VUFIND_LOCAL_MODULES=Bdtd. O autoload das classes vem do
 * composer.local.json (psr-4 "Bdtd\\" → module/Bdtd/src/Bdtd).
 *
 * @category BDTD
 * @package  Module
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
class Module
{
    /**
     * Get module configuration
     *
     * @return array
     */
    public function getConfig()
    {
        return include __DIR__ . '/config/module.config.php';
    }
}
