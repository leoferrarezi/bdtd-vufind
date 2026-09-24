function formatNumber(value) {
  const formatPtBr = new Intl.NumberFormat('pt-BR');
  return formatPtBr.format(value);
}
