function getCustomClass(dataSourceType) {
  switch (dataSourceType) {
    case 'Revista':
      return 'revista';
    case 'Repositório de Publicações':
      return 'repo-publicacoes';
    case 'Repositório de Dados':
      return 'repo-dados';
    case 'Biblioteca Digital de Teses e Dissertações':
      return 'biblioteca';
    default:
      return 'repo';
  }
}
