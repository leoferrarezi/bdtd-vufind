SRC = 'themes/bootstrap5/templates/RecordDriver/DefaultRecord/data-authors.phtml'
DEST = 'themes/bdtd/templates/RecordDriver/DefaultRecord/data-authors.phtml'
REPL = [
    ("    return '<span class=\"author-property-' . $name . '\">(' . implode(', ', array_unique(array_map($translate, $datafield))) . ')</span>';",
     "    // BDTD: perfil Lattes vira link com o ícone do Lattes\n"
     "    if ($name === 'profile') {\n"
     "        return '<a target=\"_blank\" rel=\"noopener noreferrer\" class=\"author-property-profile\" href=\"'\n"
     "            . $that->escapeHtmlAttr($datafield[0]) . '\" title=\"' . $that->transEscAttr('Lattes CV') . '\">'\n"
     "            . '<img class=\"logoLattes\" alt=\"Lattes\" src=\"' . $that->imageLink('lattes.gif') . '\" width=\"15\"></a>';\n"
     "    }\n"
     "    return '<span class=\"author-property-' . $name . '\">(' . implode(', ', array_unique(array_map($translate, $datafield))) . ')</span>';"),
]
