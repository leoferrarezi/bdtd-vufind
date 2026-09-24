<?php

/**
 * Base para as páginas institucionais estáticas da BDTD.
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
 * Página institucional: renderiza o template <controller>/home.phtml do tema.
 *
 * @category BDTD
 * @package  Controller
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://github.com/leoferrarezi/bdtd-vufind
 */
abstract class AbstractPageController extends \VuFind\Controller\AbstractBase
{
    /**
     * Página inicial da seção.
     *
     * @return ViewModel
     */
    public function homeAction()
    {
        return $this->createViewModel();
    }
}
