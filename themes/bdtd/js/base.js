const INDICATORS_FACETS =
  'search?type=AllFields&page=0&limit=0&sort=relevance&facet[]=author_facet&facet[]=dc.subject.por.fl_str_mv&facet[]=eu_rights_str_mv&facet[]=dc.publisher.program.fl_str_mv&facet[]=dc.subject.cnpq.fl_str_mv&facet[]=publishDate&facet[]=language&facet[]=format&facet[]=institution&facet[]=dc.contributor.advisor1.fl_str_mv';

let API_BASE_URL;
let REMOTE_API_URL = 'https://api-oasisbr.ibict.br/api/v1';

if (
  window.location.hostname === 'bdtd.ibict.br' ||
  window.location.hostname === 'bdtdh.ibict.br'
) {
  API_BASE_URL = `https://${window.location.host}/${
    window.location.pathname.split('/')[1]
  }/api/v1`;
  REMOTE_API_URL = `https://api-oasisbr.ibict.br/api/v1`;
} else {
  API_BASE_URL = `http://${window.location.host}/${
    window.location.pathname.split('/')[1]
  }/api/v1`;
  REMOTE_API_URL = `http://${window.location.host}:3000/api/v1`;
}

console.log('API_BASE_URL', API_BASE_URL);

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
