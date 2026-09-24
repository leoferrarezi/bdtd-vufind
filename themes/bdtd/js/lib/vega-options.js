// https://github.com/vega/vega-embed

const numberPortugueseFormat = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['R$', '']
}

const numberEnglishFormat = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['$', '']
}

const datePortugueseFormat = {
  dateTime: '%A, %e de %B de %Y. %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
  ],
  shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  months: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ],
  shortMonths: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ]
}

const dateEnglishFormat = {
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

const language = getSiteLanguage()
const vegaOptions = {
  formatLocale: language === 'pt' || language === 'pt-br' ? numberPortugueseFormat : numberEnglishFormat,
  timeFormatLocale: language === 'pt' || language === 'pt-br' ? datePortugueseFormat : dateEnglishFormat,
  actions: {
    export: true,
    source: false,
    compiled: false,
    editor: false
  },
  fontSize: 14
}
