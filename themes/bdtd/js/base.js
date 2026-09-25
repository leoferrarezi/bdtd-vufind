const INDICATORS_FACETS = [
  'author_facet',
  'dc.subject.por.fl_str_mv',
  'eu_rights_str_mv',
  'dc.publisher.program.fl_str_mv',
  'dc.subject.cnpq.fl_str_mv',
  'publishDate',
  'language',
  'format',
  'institution',
  'dc.contributor.advisor1.fl_str_mv',
];

// BDTD (VuFind 11): as URLs vêm do layout (window.BDTD), montadas a partir da
// configuração do servidor, em vez de serem deduzidas do hostname.
// - vufindApi: API de busca do próprio VuFind (/vufind/api/v1)
// - searchResults: página de resultados (/vufind/Search/Results)
// - oasisbrApi: oasisbr-api (local/config/vufind/Apis.ini); vazia = recursos desligados
const API_BASE_URL = (window.BDTD && window.BDTD.vufindApi) || '/vufind/api/v1';
const SEARCH_RESULTS_URL = (window.BDTD && window.BDTD.searchResults) || '/vufind/Search/Results';
const REMOTE_API_URL = (window.BDTD && window.BDTD.oasisbrApi) || '';

let loader = '';

function showLoader() {
  try {
    loader.style.display = 'block';
  } catch (error) {}
}
function hideLoader() {
  try {
    loader.style.display = 'none';
  } catch (error) {}
}

// BDTD (VuFind 11): fetch nativo no lugar do axios 0.21 (desatualizado, com falhas conhecidas).
async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} em ${url}`);
  }
  return response.json();
}

// Monta a query string codificando cada valor (listas viram name[]=a&name[]=b).
function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([name, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(`${name}[]`, item));
    } else if (value !== undefined && value !== null && value !== '') {
      query.append(name, value);
    }
  });
  return query.toString();
}

// Link para a busca do site, com os parâmetros codificados.
function searchResultsUrl(params) {
  return `${SEARCH_RESULTS_URL}?${buildQuery(params)}`;
}

// Aceita só links http(s); qualquer outro esquema (javascript:, data:...) vira null.
function safeHttpUrl(value) {
  try {
    const url = new URL(String(value), window.location.href);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch (error) {
    return null;
  }
}

function showMessageError(element) {
  const networksElement = document.querySelector(element);
  if (networksElement) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.setAttribute('role', 'alert');
    alert.textContent = getTranslatedText('Failed to load data sources, please try again later');
    networksElement.replaceChildren(alert);
  }
}

// filter: parâmetros da API de busca do VuFind (objeto; ver buildQuery)
async function getIndicatorsBy(filter) {
  try {
    showLoader();
    return await getJson(`${API_BASE_URL}/search?${buildQuery(filter)}`);
  } catch (errors) {
    console.error(errors);
  } finally {
    hideLoader();
  }
}

async function getIndicatorsFromVufindApi(lookfor, type) {
  return getIndicatorsBy({
    type: type || 'AllFields',
    lookfor: lookfor,
    page: 0,
    limit: 0,
    sort: 'relevance',
    facet: INDICATORS_FACETS,
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  loader = document.querySelector('.loader ');
});
