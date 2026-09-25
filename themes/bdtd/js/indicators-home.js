async function getIndicatorsByType() {
  const data = await getIndicatorsBy({
    type: "AllFields",
    facet: ["format", "instname_str"],
    sort: "relevance",
    page: 1,
    limit: 0,
  });
  return data;
}

function fillInstitution(institutions) {
  const articlesElement = document.querySelector("#institution");
  articlesElement.textContent = formatNumber(institutions.length);
}

function fillMasterThesis(value) {
  const masterThesisElement = document.querySelector("#masterThesis");
  masterThesisElement.textContent = formatNumber(value);
}

function fillDoctorThesis(value) {
  const doctorThesisElement = document.querySelector("#doctorThesis");
  doctorThesisElement.textContent = formatNumber(value);
}

function fillTotal(total) {
  const totalElement = document.querySelector("#total");
  totalElement.textContent = formatNumber(total);
}

// BDTD (VuFind 11): tolerante a formatos ausentes (antes quebrava e deixava os contadores vazios)
function getFormatCount(formats, value) {
  const found = (formats || []).find((format) => format.value == value);
  return found ? found.count : 0;
}

function getMasterThesisCount(formats) {
  return getFormatCount(formats, "masterThesis");
}

function getDoctorThesisCount(formats) {
  return getFormatCount(formats, "doctoralThesis");
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await getIndicatorsByType();
  if (!data || !data.facets) {
    return;
  }
  fillInstitution(data.facets.instname_str || []);
  const masterThesisCount = getMasterThesisCount(data.facets.format);
  fillMasterThesis(masterThesisCount);
  const doctorThesisCount = getDoctorThesisCount(data.facets.format);
  fillDoctorThesis(doctorThesisCount);
  fillTotal(masterThesisCount + doctorThesisCount);
});
