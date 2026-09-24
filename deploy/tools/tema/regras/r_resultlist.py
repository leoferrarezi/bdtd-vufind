SRC = 'themes/bootstrap5/templates/RecordDriver/DefaultRecord/result-list.phtml'
DEST = 'themes/bdtd/templates/RecordDriver/DefaultRecord/result-list.phtml'

TITLE_AUTHOR = '''    <div class="result-body">
      <?php /* BDTD: trecho destacado da busca acima do título */ ?>
      <?php if (!$this->driver->isCollection() && ($snippet = $this->driver->getHighlightedSnippet())): ?>
        <small class="result-snippet">
          <?php if (!empty($snippet['caption'])): ?>
            <strong><?=$this->transEsc($snippet['caption']) ?>:</strong>
          <?php endif; ?>
          <?php if (!empty($snippet['snippet'])): ?>
            <?=$this->translate('highlight_snippet_html', ['%%snippet%%' => $this->highlight($snippet['snippet'])]) ?>
          <?php endif; ?>
        </small>
      <?php endif; ?>
      <h2>
        <a href="<?=$this->escapeHtmlAttr($recordLinker->getUrl($this->driver))?>" class="title getFull" data-view="<?=isset($this->params) ? $this->params->getOptions()->getListViewOption() : 'list' ?>">
          <?=$this->record($this->driver)->getTitleHtml()?>
        </a>
        <?php foreach ($this->driver->tryMethod('getTitlesAltScript', [], []) as $altTitle): ?>
          <div class="title-alt">
            <?=$this->escapeOrCleanHtml($altTitle, 'title')?>
          </div>
        <?php endforeach; ?>
      </h2>
      <?php /* BDTD: bloco de autoria com ícone, autores e data */ ?>
      <div class="author">
        <div class="icon" aria-hidden="true"><?=$this->icon('bdtd-author')?></div>
        <div class="author-info">
        <?php if ($this->driver->isCollection()): ?>
          <?=implode('<br>', array_map([$this, 'escapeHtml'], $this->driver->getSummary())); ?>
        <?php else: ?>
          <?php $summAuthors = $this->driver->getPrimaryAuthorsWithHighlighting(); ?>
          <?php if (!empty($summAuthors)): ?>
            <div class="authors">
              <span><?=$this->transEsc('By')?></span>
              <?php $authorCount = count($summAuthors); ?>
              <?php foreach ($summAuthors as $i => $summAuthor): ?>
                <a href="<?=$this->record($this->driver)->getLink('author', $this->highlight($summAuthor, null, true, false))?>" class="result-author"><?=$this->highlight(rtrim($summAuthor, ','))?></a><?=$i + 1 < $authorCount ? ',' : ''?>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
          <?php
            $journalTitle = $this->driver->getContainerTitle();
            $summDate = $this->driver->getHumanReadablePublicationDates();
          ?>
          <?php if (!empty($journalTitle)): ?>
            <div class="publish-date">
              <?=$this->transEsc('Published in')?>
              <?php $containerSource = $this->driver->getSourceIdentifier(); ?>
              <?php $containerID = $this->driver->getContainerRecordID(); ?>
              <a class="container-link" href="<?=($containerID ? $this->escapeHtmlAttr($recordLinker->getUrl("$containerSource|$containerID")) : $this->record($this->driver)->getLink('journaltitle', str_replace(['{{{{START_HILITE}}}}', '{{{{END_HILITE}}}}'], '', $journalTitle)))?>"><?=$this->highlight($journalTitle) ?></a>
              <?=!empty($summDate) ? ' (' . $this->escapeHtml($summDate[0]) . ')' : ''?>
            </div>
          <?php elseif (!empty($summDate)): ?>
            <div class="publish-date"><?=$this->transEsc('Published') . ' ' . $this->escapeHtml($summDate[0])?></div>
          <?php endif; ?>
          <?php foreach ($this->driver->getContainingCollections() as $collId => $collText): ?>
            <div class="publish-date">
              <b><?=$this->transEsc('in_collection_label')?></b>
              <a class="collectionLinkText" href="<?=$this->record($this->driver)->getLink('collection', $collId)?>">
                <?=$this->escapeHtml($collText)?>
              </a>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
        </div>
      </div>
'''

LINKS = '''        <?php $urls = is_array($urls) ? $urls : []; ?>
        <?php if (!$this->driver->isCollection()): ?>
          <?php /* BDTD: "Acessar documento", numerado quando há mais de um link */ ?>
          <div class="link">
            <?php foreach (array_values($urls) as $n => $current): ?>
              <a class="fulltext" href="<?=$this->escapeHtmlAttr($this->proxyUrl($current['url']))?>" target="new">
                <?=($current['url'] == $current['desc']) ? $this->transEsc('Access document') : $this->escapeHtml($current['desc'])?><?=count($urls) > 1 ? ' (' . ($n + 1) . ')' : ''?>
              </a><br>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
'''

REPL = [
    ("<?php\n  $recordLinker = $this->recordLinker($this->results);",
     "<?php\n  // BDTD: baseado em bootstrap5/templates/RecordDriver/DefaultRecord/result-list.phtml\n"
     "  // (VuFind 11.1.0): trecho antes do título, bloco de autoria e links \"Acessar documento\".\n"
     "  $recordLinker = $this->recordLinker($this->results);"),
    between('    <div class="result-body">\n      <h2>',
            "            <?=$this->translate('highlight_snippet_html', ['%%snippet%%' => $this->highlight($snippet['snippet'])]) ?><br>\n"
            "          <?php endif; ?>\n        <?php endif; ?>\n      <?php endif; ?>\n",
            TITLE_AUTHOR),
    between("        <?php $urls = is_array($urls) ? $urls : []; ?>",
            "          <?php endforeach; ?>\n        <?php endif; ?>\n",
            LINKS),
]
