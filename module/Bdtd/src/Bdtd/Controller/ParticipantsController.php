<?php

namespace Bdtd\Controller;

class ParticipantsController extends \VuFind\Controller\AbstractBase
{
    public function homeAction()
    {
        return $this->createViewModel();
    }
}
