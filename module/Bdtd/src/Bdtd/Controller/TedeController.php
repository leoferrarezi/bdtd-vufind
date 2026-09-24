<?php

namespace Bdtd\Controller;

class TedeController extends \VuFind\Controller\AbstractBase
{

    public function homeAction()
    {
        return $this->createViewModel();
    }
}

