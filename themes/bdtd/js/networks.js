async function getAllInstitutions() {
  const data = await getIndicatorsBy({
    type: "AllFields",
    facet: ["instname_str"],
    sort: "relevance",
    page: 1,
    limit: 0,
  });
  if (!data || !data.facets || !Array.isArray(data.facets.instname_str)) {
    showMessageError(".networks");
    return [];
  }
  return data.facets.instname_str;
}

// BDTD (VuFind 11): arquivo gerado no navegador (Blob) e baixado; antes abria uma URL
// data:, que os navegadores atuais bloqueiam. Aspas escapadas e células que começam
// com = + - @ prefixadas com ' para o Excel não as tratar como fórmula.
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

function convertToCSV(allInstitutions) {
  const lines = [["Instituição", "Quantidade de itens"].map(csvCell).join(",")];
  allInstitutions.forEach((item) => {
    lines.push([csvCell(item.value), Number(item.count) || 0].join(","));
  });
  return lines.join("\r\n") + "\r\n";
}

function exportsCSV(allInstitutions) {
  const btnExport = document.querySelector(".btn-export-csv");
  if (!btnExport) {
    return;
  }
  btnExport.addEventListener("click", () => {
    // BOM para o Excel reconhecer UTF-8 (acentos)
    const blob = new Blob(["﻿" + convertToCSV(allInstitutions)], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "instituicoes-bdtd.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
}

// Link para os resultados da instituição: usa o href da faceta (query string gerada
// pelo próprio VuFind) só se for mesmo uma query string; senão monta o filtro.
function institutionUrl(institution) {
  if (typeof institution.href === "string" && institution.href.startsWith("?")) {
    return SEARCH_RESULTS_URL + institution.href;
  }
  return searchResultsUrl({ filter: [`instname_str:"${institution.value}"`] });
}

document.addEventListener("DOMContentLoaded", async () => {
  const allInstitutions = await getAllInstitutions();
  new gridjs.Grid({
    columns: [
      {
        name: "Instituição",
        sort: true,
      },
      {
        name: "Documentos",
        sort: true,
        // Elemento criado pelo gridjs (texto escapado); a célula guarda o número,
        // então a ordenação é numérica.
        formatter: (count, row) =>
          gridjs.h("a", { href: row.cells[2].data }, formatNumber(count)),
      },
      {
        name: "url",
        hidden: true,
      },
    ],
    // busca só pelo nome da instituição (não pela coluna oculta com a URL)
    search: {
      selector: (cell, rowIndex, cellIndex) => (cellIndex === 0 ? cell : ""),
    },
    pagination: {
      limit: 20,
      summary: false,
    },
    language: {
      search: {
        placeholder: "🔍 Buscar por...",
      },
      pagination: {
        previous: "Anterior",
        next: "Próximo",
        showing: "😃 Mostrando",
        results: () => "Resultado",
      },
    },
    data: allInstitutions.map((institution) => [
      String(institution.value ?? ""),
      Number(institution.count) || 0,
      institutionUrl(institution),
    ]),
  }).render(document.getElementById("networksWrapper"));
  exportsCSV(allInstitutions);
});
