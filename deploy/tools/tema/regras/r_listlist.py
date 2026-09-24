SRC = 'themes/bootstrap5/templates/search/list-list.phtml'
DEST = 'themes/bdtd/templates/search/list-list.phtml'
REPL = [
    ("<?php\n  if (!isset($this->indexStart))",
     "<?php\n  // BDTD: baseado em bootstrap5/templates/search/list-list.phtml (VuFind 11.1.0):\n"
     "  // card com a classe card-results e número em destaque. Registros ocultos agora\n"
     "  // saem por config (searches.ini [RawHiddenFilters]), não mais por código aqui.\n"
     "  if (!isset($this->indexStart))"),
    ('class="result<?=$current->supportsAjaxStatus() ? \' ajaxItem\' : \'\'?>"',
     'class="result card-results<?=$current->supportsAjaxStatus() ? \' ajaxItem\' : \'\'?>"'),
    ("          <?=$recordNumber ?>\n", "          <span class=\"h2\"><?=$recordNumber ?></span>\n"),
]
