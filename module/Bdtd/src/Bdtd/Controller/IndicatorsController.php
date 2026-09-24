<?php

namespace Bdtd\Controller;

class IndicatorsController extends \VuFind\Controller\AbstractBase
{
  public function homeAction()
  {
    return $this->createViewModel();
  }
}
