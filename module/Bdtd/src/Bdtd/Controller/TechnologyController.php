<?php

namespace Bdtd\Controller;

class TechnologyController extends \VuFind\Controller\AbstractBase
{

    public function homeAction()
    {
        return $this->createViewModel();
    }
}

