<?php

namespace Bdtd\Controller;

class NetworkController extends \VuFind\Controller\AbstractBase
{
    public function homeAction()
    {
        return $this->createViewModel();
    }

}

