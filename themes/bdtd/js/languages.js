function getSiteLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const browserLanguage = navigator.language || navigator.userLanguage;

  const languageUserSelected = urlParams.get('lng');
  if (languageUserSelected) {
    localStorage.setItem('language', languageUserSelected);
    return languageUserSelected;
  } else {
    return localStorage.getItem('language') || browserLanguage;
  }
}
const lng = getSiteLanguage();

function getTranslatedText(key) {
  let text = '';
  switch (lng) {
    case 'en':
      text = english.get(key);
      return text || key;
    case 'en-US':
      text = english.get(key);
      return text || key;
    case 'pt-br':
      text = portuguese.get(key);
      return text || key;
    case 'pt':
      text = portuguese.get(key);
      return text || key;
    default:
      text = english.get(key);
      return text || key;
  }
}

const english = new Map();
// gráfico de idiomas
english.set('eng', 'English');
english.set('fra', 'French');
english.set('ita', 'Italian');
english.set('por', 'Portuguese');
english.set('spa', 'Spanish');

english.set('Inglês', 'English');
english.set('Francês', 'French');
english.set('Italiano', 'Italian');
english.set('Português', 'Portuguese');
english.set('Espanhol', 'Spanish');

// tipos de documento
english.set('article', 'Article');
english.set('bachelorThesis', 'Bachelor Thesis');
english.set('book', 'Book');
english.set('bookPart', 'Book Part');
english.set('conferenceObject', 'Conference Object');
english.set('dataset', 'Dataset');
english.set('doctoralThesis', 'Doctoral Thesis');
english.set('masterThesis', 'Master Thesis');
english.set('other', 'Other');
english.set('patent', 'Patent');
english.set('report', 'Report');
english.set('review', 'Review');
english.set('workingPaper', 'Working Paper');
// tipos de acesso
english.set('closedAccess', 'Closed Access');
english.set('embargoedAccess', 'Embargoed Access');
english.set('openAccess', 'Open Access');
english.set('restrictedAccess', 'Restricted Access');

english.set('Subject', 'Subject');
english.set('Author', 'Author');
english.set('Title', 'Title');
english.set('Search among', 'Search among');
english.set('documents', 'documents');
english.set('Documentos', 'Documents');
english.set('Tipo de fonte', 'Source type');
english.set('Count', 'Count');

// data sources page
english.set('Todas as fontes', 'All sources');
english.set('Revista Científica', 'Scientific Journals');
english.set('Repositório de Publicações', 'Literature Repository');
english.set(
  'Biblioteca Digital de Teses e Dissertações',
  'Digital Library of Theses and Dissertations'
);
english.set('Repositório de Dados de Pesquisa', 'Research Data Repository');
english.set('Portal Agregador', 'Aggregator Portal');
english.set('Portal de Livros', 'Book Portal');
english.set(
  'Biblioteca Digital de Monografias',
  'Digital Library of Monographs'
);
english.set('Biblioteca Digital de Monografia', 'Digital Library of Monograph');
english.set('Indefinido', 'Undefined');
english.set('Retornaram', ' ');
english.set('fontes', 'sources returned');
english.set('Instituição responsável', 'Responsible institution');
english.set('Número de documentos coletados', 'Number of collected documents');
english.set('Fonte', 'Source');
english.set('Fontes', 'Sources');
english.set('Month', 'Month');
english.set('Source email', 'Source email');
english.set('Collected documents', 'Collected documents');
english.set(
  'Failed to load data sources, please try again later',
  'Failed to load data sources, please try again later.'
);

const portuguese = new Map();
// gráfico de idiomas
portuguese.set('eng', 'Inglês');
portuguese.set('fra', 'Francês');
portuguese.set('ita', 'Italiano');
portuguese.set('por', 'Português');
portuguese.set('spa', 'Espanhol');
// tipos de documento
portuguese.set('article', 'Artigo');
portuguese.set('bachelorThesis', 'TCC');
portuguese.set('book', 'Livro');
portuguese.set('bookPart', 'Capítulo de livro');
portuguese.set('conferenceObject', 'Artigo de conferência');
portuguese.set('dataset', 'Conjunto de dados');
portuguese.set('doctoralThesis', 'Tese');
portuguese.set('masterThesis', 'Dissertação');
portuguese.set('other', 'Outros');
portuguese.set('patent', 'Patente');
portuguese.set('report', 'Relatório');
portuguese.set('review', 'Artigo (review)');
portuguese.set('workingPaper', 'Artigo (working paper)');
// tipos de acesso
portuguese.set('closedAccess', 'Acesso fechado');
portuguese.set('embargoedAccess', 'Acesso embargado');
portuguese.set('openAccess', 'Acesso aberto');
portuguese.set('restrictedAccess', 'Acesso restrito');

portuguese.set('Subject', 'Assunto');
portuguese.set('Author', 'Autor');
portuguese.set('Title', 'Título');

portuguese.set('Search among', 'Pesquise entre');
portuguese.set('documents', 'documentos');
// data sources page
portuguese.set('Todas as fontes', 'Todas as fontes');
portuguese.set('Revista Científica', 'Revista Científica');
portuguese.set('Repositório de Publicações', 'Repositório de Publicações');
portuguese.set(
  'Biblioteca Digital de Teses e Dissertações',
  'Biblioteca Digital de Teses e Dissertações'
);
portuguese.set(
  'Repositório de Dados de Pesquisa',
  'Repositório de Dados de Pesquisa'
);
portuguese.set('Portal Agregador', 'Portal Agregador');
portuguese.set('Portal de Livros', 'Portal de Livros');
portuguese.set(
  'Biblioteca Digital de Monografias',
  'Biblioteca Digital de Monografias'
);
portuguese.set(
  'Biblioteca Digital de Monografia',
  'Biblioteca Digital de Monografia'
);
portuguese.set('Indefinido', 'Indefinido');
portuguese.set('Retornaram', 'Retornaram');
portuguese.set('fontes', 'fontes');
portuguese.set('Instituição responsável', 'Instituição responsável');
portuguese.set(
  'Número de documentos coletados',
  'Número de documentos coletados'
);
portuguese.set('Documentos', 'Documentos');
portuguese.set('Tipo de fonte', 'Tipo de fonte');
portuguese.set('Fonte', 'Fonte');
portuguese.set('Fontes', 'Fontes');
portuguese.set('Month', 'Mês');
portuguese.set('Source email', 'E-mail da fonte');
portuguese.set('Collected documents', 'Documentos coletados');
portuguese.set('Count', 'Quantidade');
portuguese.set(
  'Failed to load data sources, please try again later',
  'Falha ao carregar fontes de dados, tente novamente mais tarde.'
);
