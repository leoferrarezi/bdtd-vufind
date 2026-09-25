async function getANetworkByName(networkId) {
  // BDTD (VuFind 11): sem oasisbr-api configurada (Apis.ini), não há detalhe da fonte
  if (!REMOTE_API_URL || !networkId) {
    return null;
  }
  try {
    showLoader();
    return await getJson(`${REMOTE_API_URL}/networks/${encodeURIComponent(networkId)}`);
  } catch (errors) {
    console.error(errors);
    return null;
  } finally {
    hideLoader();
  }
}

// BDTD (VuFind 11): a tabela é montada com elementos e textContent, e não com
// innerHTML, porque os dados vêm de uma API externa (oasisbr-api).
function datasourceRow(label, content) {
  const row = document.createElement('tr');
  const labelCell = document.createElement('td');
  labelCell.textContent = label;
  const valueCell = document.createElement('td');
  if (content instanceof Node) {
    valueCell.appendChild(content);
  } else {
    valueCell.textContent = content === undefined || content === null || content === '' ? '-' : String(content);
  }
  row.append(labelCell, valueCell);
  return row;
}

function datasourceLink(href, text, external) {
  if (!href) {
    return '-';
  }
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}

function fillDatasource(network) {
  const table = document.querySelector('#dataSource');
  const sourceUrl = network.sourceUrl != null ? safeHttpUrl(network.sourceUrl) : null;
  const documentsUrl = searchResultsUrl({
    type: 'AllFields',
    filter: [`network_name_str:"${network.name ?? ''}"`],
  });
  const idLabel =
    network.sourceType === 'Revista Científica'
      ? 'ISSN:'
      : network.sourceType === 'Repositório de Dados de Pesquisa'
      ? 'ID re3data:'
      : 'ID OpenDOAR:';
  table.replaceChildren(
    datasourceRow(`${getTranslatedText('Tipo de fonte')}:`, network.sourceType),
    datasourceRow(`${getTranslatedText('Fonte')}:`, network.name),
    datasourceRow(`${getTranslatedText('Instituição responsável')}:`, network.institution),
    datasourceRow('URL:', datasourceLink(sourceUrl, sourceUrl, true)),
    datasourceRow(`${getTranslatedText('Source email')}:`, network.email),
    datasourceRow(
      `${getTranslatedText('Documents collected')}:`,
      datasourceLink(documentsUrl, network.validSize ?? '-', false)
    ),
    datasourceRow(
      idLabel,
      network.issn != null && network.issn !== 'null' ? network.issn : getTranslatedText('Not registered')
    )
  );
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
  if (!network || typeof network !== 'object') {
    showMessageError('#dataSource');
    return;
  }
  setCustomColor(network.sourceType);
  fillDatasource(network);
});
