async function getIndicatorsByType() {
  const data = await getIndicatorsBy(
    "search?type=AllFields&facet[]=format&facet[]=instname_str&sort=relevance&page=1&limit=0"
  );
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

function getMasterThesisCount(formats) {
  var masterThesis = formats.find((format) => {
    return format.value == "masterThesis";
  });
  return masterThesis.count;
}

function getDoctorThesisCount(formats) {
  var doctoralThesis = formats.find((format) => {
    return format.value == "doctoralThesis";
  });
  return doctoralThesis.count;
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await getIndicatorsByType();
  fillInstitution(data.facets.instname_str);
  const masterThesisCount = getMasterThesisCount(data.facets.format);
  console.log("masterThesisCount", masterThesisCount);
  fillMasterThesis(masterThesisCount);
  const doctorThesisCount = getDoctorThesisCount(data.facets.format);
  fillDoctorThesis(doctorThesisCount);
  fillTotal(masterThesisCount + doctorThesisCount);
});
