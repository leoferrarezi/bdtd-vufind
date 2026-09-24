<?php

/**
 * Páginas de fontes de dados (instituições coletadas) da BDTD.
 *
 * PHP version 8
 *
 * @category BDTD
 * @package  Controller
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */

namespace Bdtd\Controller;

use Laminas\View\Model\ViewModel;

/**
 * Lista de fontes (home) e detalhe de uma fonte (datasource).
 *
 * @category BDTD
 * @package  Controller
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
class DataSourcesController extends AbstractPageController
{
    /**
     * Detalhe de uma fonte de dados. O ID é consumido pelo JS do tema, que busca
     * os dados na oasisbr-api; aqui só é validado para não refletir lixo na página.
     *
     * @return ViewModel
     */
    public function datasourceAction()
    {
        $id = (string)$this->params()->fromQuery('id', '');
        if (!preg_match('/^[\w.-]{1,100}$/', $id)) {
            $id = '';
        }
        return $this->createViewModel(['id' => $id]);
    }
}
