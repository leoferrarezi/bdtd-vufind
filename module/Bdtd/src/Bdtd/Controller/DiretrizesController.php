<?php

namespace Bdtd\Controller;

class DiretrizesController extends \VuFind\Controller\AbstractBase
{

    public function homeAction()
    {
        return $this->createViewModel();
    }
}
