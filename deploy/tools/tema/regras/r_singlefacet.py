SRC = 'themes/bootstrap5/templates/Recommend/SideFacets/single-facet.phtml'
DEST = 'themes/bdtd/templates/Recommend/SideFacets/single-facet.phtml'
REPL = [
    ("  $displayText = '';\n  if ($this->facet['isExcluded']) {",
     "  // BDTD: facetas hierárquicas do CNPq vêm como \"A::B::C\"; exibe só o último nível.\n"
     "  $facetText = (string)($this->facet['displayText'] ?? '');\n"
     "  if (str_contains($facetText, '::')) {\n"
     "    $parts = explode('::', $facetText);\n"
     "    $facetText = end($parts);\n"
     "  }\n"
     "  $displayText = '';\n  if ($this->facet['isExcluded']) {"),
    ("  if ('' !== (string)($this->facet['displayText'] ?? '')) {\n    $displayText .= $this->escapeHtml($this->facet['displayText']);",
     "  if ('' !== $facetText) {\n    $displayText .= $this->escapeHtml($facetText);"),
]
