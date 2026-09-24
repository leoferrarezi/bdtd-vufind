SRC = 'themes/bootstrap5/templates/search/advanced/layout.phtml'
DEST = 'themes/bdtd/templates/search/advanced/layout.phtml'

HERO = '''<?php /* BDTD: faixa superior igual à da home */ ?>
<div class="search-box">
  <div class="container">
    <div class="box-title">
      <h1 class="bdtd-title"><?=$this->transEsc('Biblioteca Digital Brasileira de Teses e Dissertações')?></h1>
      <p class="bdtd-subtitle h4">Acesso e visibilidade às teses e dissertações brasileiras</p>
    </div>
    <?=$this->render('search/bdtd-indicators.phtml')?>
  </div>
</div>
<div class="container">
<?=$this->flashmessages()?>
<div role="search" class="bottom-search-form adv-search-form">
<div class="adv-help">
  <a href="<?=$this->url('search-home')?>" class="btn outlined-primary" rel="nofollow"><?=$this->icon('ui-close')?> <?=$this->transEsc('Close advanced search')?></a>
  <span class="adv-help-label"><?=$this->transEsc('Search Tips')?>:</span>
  <?php foreach ($helpTopics as $topic => $title): ?>
    <a class="help-link" data-lightbox href="<?=$this->url('help', ['topic' => $topic])?>"><?=$this->transEsc($title)?></a>
  <?php endforeach; ?>
</div>'''

MATCH_TOP = '''            <div id="group<?=$group ?>" class="adv-group adv-group-form">
              <?php /* BDTD: seletor de combinação no topo do grupo */ ?>
              <div class="adv-group-match adv-group-match-form">
                <label class="search_bool" for="search_bool<?=$group ?>"><?=$this->transEsc('search_match')?>:&nbsp;</label>
                <select name="bool<?=$group ?>[]" id="search_bool<?=$group ?>" class="form-select">
                  <option value="AND"<?php if (isset($setSearchGroups[$group]) && 'AND' == $setSearchGroups[$group]):?> selected<?php endif; ?>><?=$this->transEsc('search_AND')?></option>
                  <option value="OR"<?php if (isset($setSearchGroups[$group]) && 'OR' == $setSearchGroups[$group]):?> selected<?php endif; ?>><?=$this->transEsc('search_OR')?></option>
                  <option value="NOT"<?php if (isset($setSearchGroups[$group]) && 'NOT' == $setSearchGroups[$group]):?> selected<?php endif; ?>><?=$this->transEsc('search_NOT')?></option>
                </select>
              </div>
              <div class="adv-group-terms adv-group-terms-form">'''

FOOTER = '''  </form>
</div>
<?php /* BDTD: atalhos e bloco institucional, como na home */ ?>
<?=$this->render('search/bdtd-shortcuts.phtml', ['pullUp' => false])?>
</div>
<div class="container">
  <?=$this->render('content-home.phtml')?>
</div>
'''

REPL = [
    ("<?php\n  // Set page title.\n  $this->headTitle($this->translate('Advanced Search'));",
     "<?php\n  // BDTD: baseado em bootstrap5/templates/search/advanced/layout.phtml (VuFind 11.1.0):\n"
     "  // faixa superior com contadores, ajuda no topo, seletor de combinação no topo de cada\n"
     "  // grupo, atalhos e bloco institucional embaixo. Mudanças marcadas com \"BDTD\".\n"
     "  // Set page title.\n  $this->headTitle($this->translate('Advanced Search'));\n"
     "  $this->layout()->layoutFull = true;\n"
     "  $this->assetManager()->appendScriptLink('indicators-home.js');"),
    ("  // Set up breadcrumbs:\n  $this->breadcrumbs()->set($this->translate('Search'), $this->searchMemory()->getLastSearchUrl())\n    ->add($this->translate('Advanced'), active: true);",
     "  // BDTD: sem breadcrumbs (página de faixa inteira, como a home)\n  $this->breadcrumbs()->disable();"),
    ("<?=$this->flashmessages()?>\n<div role=\"search\">", HERO),
    ("        <h1 class=\"float-start\"><?=$this->transEsc('Advanced Search')?></h1>",
     "        <h2 class=\"float-start\"><?=$this->transEsc('Advanced Search')?></h2>"),
    ('            <div id="group<?=$group ?>" class="adv-group">\n              <div class="adv-group-terms">', MATCH_TOP),
    between('              <div class="adv-group-match">\n                <label class="search_bool">',
            "                </select>\n              </div>\n", ""),
    ('<input class="btn btn-primary" type="submit"', '<input class="btn contained-primary" type="submit"', "all"),
    # Ajuda já aparece no topo: não repetir na lateral
    ("      <?php if ($helpTopics): ?>\n        <h2><?=$this->transEsc('Search Tips')?></h2>",
     "      <?php if (false && $helpTopics): /* BDTD: ajuda exibida no topo */ ?>\n        <h2><?=$this->transEsc('Search Tips')?></h2>"),
    ("  </form>\n</div>\n", FOOTER),
    # BDTD: sem filtros aplicados a lateral fica vazia; nesse caso o formulário ocupa a largura toda
    ("    <div class=\"<?=$this->layoutClass('mainbody')?>\">",
     "    <?php $bdtdHasSidebar = $hasDefaultsApplied || $checkboxFilters || $searchFilters; ?>\n"
     "    <div class=\"<?=$this->layoutClass('mainbody', (bool)$bdtdHasSidebar)?>\">"),
    ("    <div class=\"<?=$this->layoutClass('sidebar')?>\">",
     "    <?php if ($bdtdHasSidebar): ?>\n    <div class=\"<?=$this->layoutClass('sidebar')?>\">"),
    ("      <?php endif; ?>\n    </div>\n  </form>",
     "      <?php endif; ?>\n    </div>\n    <?php endif; ?>\n  </form>"),
]
