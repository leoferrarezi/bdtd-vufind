SRC = 'themes/bootstrap5/templates/search/searchbox.phtml'
DEST = 'themes/bdtd/templates/search/searchbox.phtml'
REPL = [
    ("<?php\n    // Initialize from current search",
     "<?php\n    // BDTD: baseado em bootstrap5/templates/search/searchbox.phtml (VuFind 11.1.0);\n"
     "    // mudanças só visuais, marcadas com \"BDTD\".\n    // Initialize from current search"),
    ('<form id="searchForm" class="searchForm navbar-form navbar-left flip"',
     '<form id="searchForm" class="searchForm"'),
    ('<div class="searchForm-inputs">',
     '<div class="searchForm-inputs search-form"><?php /* BDTD: classe search-form do CSS legado */ ?>'),
    ("'class' => 'searchForm_lookfor form-control search-query',",
     "'class' => 'searchForm_lookfor form-control search-query search-input', // BDTD: search-input"),
    ("<button type=\"submit\" class=\"btn btn-primary\"><?=$this->icon('search') ?> <?=$this->transEsc('Find')?></button>",
     "<button type=\"submit\" class=\"btn contained-primary\"><?=$this->transEsc('Find')?></button><?php /* BDTD */ ?>"),
    ("<a href=\"<?=$advSearchLink?>\" class=\"advanced-search-link btn btn-link\" rel=\"nofollow\"><?=$this->transEsc('Advanced')?></a>",
     "<a href=\"<?=$advSearchLink?>\" class=\"advanced-search-link btn outlined-primary\" rel=\"nofollow\"><?=$this->icon('bdtd-advanced')?> <?=$this->transEsc('Advanced Search')?></a><?php /* BDTD */ ?>"),
]
