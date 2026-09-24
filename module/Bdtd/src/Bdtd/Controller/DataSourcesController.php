<?php

namespace Bdtd\Controller;

class DataSourcesController extends \VuFind\Controller\AbstractBase
{
  public function homeAction()
  {
    return $this->createViewModel();
  }

  public function datasourceAction()
  {
    $id = $this->params()->fromQuery('id');
    return $this->createViewModel([
      'id' => $id,
    ]);
  }
}
