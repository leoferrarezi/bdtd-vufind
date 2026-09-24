SRC = 'themes/bootstrap5/templates/RecordDriver/DefaultRecord/core.phtml'
DEST = 'themes/bdtd/templates/RecordDriver/DefaultRecord/core.phtml'
H1_OLD = "<h1<?=$this->schemaOrg()->getAttributes(['property' => 'name'])?>><?=$this->escapeOrCleanHtml($this->driver->getShortTitle(), 'title', renderingContext: 'heading') . ' ' . $this->escapeOrCleanHtml($this->driver->getSubtitle(), 'title', renderingContext: 'heading') . ' ' . $this->escapeOrCleanHtml($this->driver->getTitleSection(), 'title', renderingContext: 'heading')?></h1>"
H1_NEW = """<?php /* BDTD: título curto; se não houver, o título completo */ ?>
    <?php $bdtdTitle = $this->driver->getShortTitle() ?: $this->driver->getTitle(); ?>
    <h1<?=$this->schemaOrg()->getAttributes(['property' => 'name'])?>><?=$this->escapeOrCleanHtml($bdtdTitle, 'title', renderingContext: 'heading') . ' ' . $this->escapeOrCleanHtml($this->driver->getSubtitle(), 'title', renderingContext: 'heading') . ' ' . $this->escapeOrCleanHtml($this->driver->getTitleSection(), 'title', renderingContext: 'heading')?></h1>"""
REPL = [
    ("<?php\n  $this->metadata()->generateMetatags($this->driver);",
     "<?php\n  // BDTD: baseado em bootstrap5/templates/RecordDriver/DefaultRecord/core.phtml (VuFind 11.1.0).\n"
     "  // Resumo não aparece sob o título: vai como linha da tabela (Bdtd\\RecordDataFormatter\\Specs\\Bdtd).\n"
     "  $this->metadata()->generateMetatags($this->driver);"),
    (H1_OLD, H1_NEW),
    between("    <?php $summary = $this->driver->getSummary(); ?>",
            "      <?php endif; ?>\n    <?php endif; ?>\n", ""),
]
