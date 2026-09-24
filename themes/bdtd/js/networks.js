async function getAllInstitutions() {
  try {
    showLoader();
    const data = await getIndicatorsBy(
      "search?type=AllFields&facet[]=instname_str&sort=relevance&page=1&limit=0"
    );
    hideLoader();
    return data.facets.instname_str;
  } catch (errors) {
    hideLoader();
    showMessageError("#networks-page");
    console.error(errors);
  }
}
async function getNetworks() {
  try {
    showLoader();
    const response = await axios.get(
      `${API_BASE_URL}/search?facet[]=network_acronym_str&sort=relevance&limit=0`
    );
    hideLoader();
    const networks = response.data.facets.network_acronym_str;
    return networks;
  } catch (errors) {
    hideLoader();
    showMessageError("#networks-page");
    console.error(errors);
  }
}

function exportsCSV(allInstitutions) {
  const btnExport = document.querySelector(".btn-export-csv");
  btnExport.addEventListener("click", () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Convert JSON to CSV & Display CSV
    csvContent = csvContent + ConvertToCSV(allInstitutions);
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  });
}

function ConvertToCSV(allInstitutions) {
  let csv = "Instituição,Quantidade de itens";
  csv += "\r\n";
  allInstitutions.forEach((item) => {
    let line =
      `"${item.value || ""}"` +
      "," +
      item.count;
    line = line.replaceAll("#", "%23");
    csv += line + "\r\n";
  });
  return csv;
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
      },
    ],
    search: true,
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
      institution.value,
      gridjs.html(
        `<a href='../Search/Results${institution.href}'>${institution.count}</a>`
      ),
    ]),
  }).render(document.getElementById("networksWrapper"));
  exportsCSV(allInstitutions);
});
