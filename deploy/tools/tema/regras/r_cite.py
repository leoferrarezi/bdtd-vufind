SRC = 'themes/bootstrap5/templates/record/cite.phtml'
DEST = 'themes/bdtd/templates/record/cite.phtml'
REPL = [
    ("  <div class=\"text-muted text-center\"><?=$this->transEsc('Warning: These citations may not always be 100% accurate')?>.</div>",
     "  <?php /* BDTD: nota sobre o estilo ABNT e o Zotero */ ?>\n"
     "  <div class=\"text-muted text-center\">\n"
     "    <?=$this->transEsc('ABNT Citation Note')?>\n"
     "    <a href=\"https://zenodo.org/record/6376312\" target=\"_blank\" rel=\"noopener noreferrer\">Zotero</a>\n"
     "    <?=$this->transEsc('ABNT Citation Note2')?>\n"
     "  </div>"),
]
