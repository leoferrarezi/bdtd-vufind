async function getANetworkByName(networkId) {
  try {
    showLoader();
    const response = await axios.get(`${REMOTE_API_URL}/networks/${networkId}`);
    hideLoader();
    const network = response.data;
    return network;
  } catch (errors) {
    hideLoader();
    console.error(errors);
  }
}

function fillDatasource(network) {
  const table = document.querySelector('#dataSource');
  table.innerHTML = `<tr>
      <td>${getTranslatedText('Tipo de fonte')}:</td >
        <td>${network.sourceType}</td>
    </tr >
    <tr>
      <td>${getTranslatedText('Fonte')}:</td>
      <td>${network.name}</td>
    </tr>
    <tr>
      <td>${getTranslatedText('Instituição responsável')}:</td>
      <td>${network.institution}</td>
    </tr>
    <tr>
      <td>URL: </td>
      <td>${
        network.sourceUrl != null
          ? '<a href="' +
            network.sourceUrl +
            '" target="_blank" rel="noopener noreferrer">' +
            network.sourceUrl +
            '</a >'
          : '-'
      }
      </td>
    </tr>
    <tr>
      <td>${getTranslatedText('Source email')}: </td>
      <td>${network.email != null ? network.email : '-'}</td >
    </tr>
    <tr>
      <td>${getTranslatedText('Documents collected')}:</td>
      <td>
        <a href="../Search/Results?type=AllFields&filter%5B%5D=network_name_str%3A%22+${
          network.name
        }">
          ${network.validSize}
        </a>
      </td>
    </tr>
    <tr>
      <td>
        ${
          network.sourceType === 'Revista Científica'
            ? 'ISSN:'
            : network.sourceType === 'Repositório de Dados de Pesquisa'
            ? 'ID re3data:'
            : 'ID OpenDOAR:'
        }
      </td >
      <td>${
        network.issn != 'null'
          ? network.issn
          : getTranslatedText('Not registered')
      } 
    </tr >`;
}

function setCustomColor(sourceType) {
  const titleBar = document.querySelector('.page-title-bar');
  titleBar.classList.remove(
    'revista',
    'repo-publicacoes',
    'repo-dados',
    'biblioteca',
    'monografias',
    'preprints',
    'agregador',
    'repo'
  );
  switch (sourceType) {
    case 'Revista Científica':
      titleBar.classList.add('revista');
      break;
    case 'Repositório de Publicações':
      titleBar.classList.add('repo-publicacoes');
      break;
    case 'Repositório de Dados de Pesquisa':
      titleBar.classList.add('repo-dados');
      break;
    case 'Biblioteca Digital de Teses e Dissertações':
      titleBar.classList.add('biblioteca');
      break;
    case 'Biblioteca Digital de Monografias':
      titleBar.classList.add('monografias');
      break;
    case 'Biblioteca Digital de Monografia':
      titleBar.classList.add('monografias');
      break;
    case 'Servidor de Preprints':
      titleBar.classList.add('preprints');
      break;
    case 'Portal Agregador':
      titleBar.classList.add('agregador');
      break;
    default:
      titleBar.classList.add('repo');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const networkId = urlParams.get('id');
  const network = await getANetworkByName(networkId);
  setCustomColor(network.sourceType);
  fillDatasource(network);
});
