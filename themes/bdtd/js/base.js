const INDICATORS_FACETS =
  'search?type=AllFields&page=0&limit=0&sort=relevance&facet[]=author_facet&facet[]=dc.subject.por.fl_str_mv&facet[]=eu_rights_str_mv&facet[]=dc.publisher.program.fl_str_mv&facet[]=dc.subject.cnpq.fl_str_mv&facet[]=publishDate&facet[]=language&facet[]=format&facet[]=institution&facet[]=dc.contributor.advisor1.fl_str_mv';

// BDTD (VuFind 11): as URLs vêm do layout (window.BDTD), montadas a partir da
// configuração do servidor, em vez de serem deduzidas do hostname.
// - vufindApi: API de busca do próprio VuFind (/vufind/api/v1)
// - oasisbrApi: oasisbr-api (local/config/vufind/Apis.ini); vazia = recursos desligados
const API_BASE_URL = (window.BDTD && window.BDTD.vufindApi) || '/vufind/api/v1';
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

function showMessageError(element) {
  const networksElement = document.querySelector(element);
  if (networksElement) {
    networksElement.innerHTML = `<div class="alert alert-danger" role="alert">
    ${getTranslatedText('Failed to load data sources, please try again later')}
    </div>`;
  }
}

async function getIndicatorsBy(filter) {
  try {
    showLoader();
    const response = await axios.get(`${API_BASE_URL}/${filter}`);
    hideLoader();
    return response.data;
  } catch (errors) {
    hideLoader();
    console.error(errors);
  }
}

async function getIndicatorsFromVufindApi(lookfor, type) {
  try {
    let URL = `${API_BASE_URL}/${INDICATORS_FACETS}`;
    if (lookfor) {
      URL = URL + `&lookfor=${lookfor}`;
    }
    if (type) {
      URL = URL + `&type=${type}`;
    }
    showLoader();
    const response = await axios.get(URL);
    hideLoader();
    return response.data;
  } catch (errors) {
    hideLoader();
    console.error(errors);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  loader = document.querySelector('.loader ');
});
