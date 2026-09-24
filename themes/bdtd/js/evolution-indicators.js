async function getIndicatorsFromRemoteApiBy(filter) {
  try {
    showLoader();
    const response = await axios.get(`${REMOTE_API_URL}${filter}`);
    hideLoader();
    const indicators = response.data;
    return indicators;
  } catch (errors) {
    hideLoader();
    showMessageError('#temporal-dashboard');
    console.error(errors);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // global variables
  let evolutionIndicators = null;
  let sourceInitDate = null;
  let sourceEndDate = null;
  let docInitDate = null;
  let docEndDate = null;
  let sourceTypeNamesAndAbbreviationMap = new Map();
  let sourcesFilters = [];
  let docsFilters = [];
  let diffOfMonths = 12;

  function fillSourceTypeNamesAndAbbreviationMap() {
    const tempMap = new Map();
    for (let index = 0; index < evolutionIndicators.length; index++) {
      const sourceTypeName = getTranslatedText(
        evolutionIndicators[index].content.sourceType
      );
      if (tempMap.get(sourceTypeName) != null) {
        break;
      }
      tempMap.set(sourceTypeName, getAbbreviationFrom(sourceTypeName));
    }
    sourceTypeNamesAndAbbreviationMap = new Map([...tempMap.entries()].sort());
    sourcesFilters = Array.from(sourceTypeNamesAndAbbreviationMap.keys());
    docsFilters = Array.from(sourceTypeNamesAndAbbreviationMap.keys());
  }

  function truncateDateToDay(date) {
    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  function lastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  vega.expressionFunction('formatGetInitials', function (datum, params) {
    return sourceTypeNamesAndAbbreviationMap.get(datum);
  });

  function getAbbreviationFrom(name) {
    const names = name.split(' ');
    return names.length === 1
      ? names[0]
      : names
          .map((item) => (item.length > 3 ? item[0] : ''))
          .join()
          .replaceAll(',', '');
  }

  function createCheckboxsFilters() {
    const sourcesBoxFilters = document.querySelector('[data-filters-sources]');
    const docsBoxFilters = document.querySelector('[data-filters-docs]');
    for (const key of sourceTypeNamesAndAbbreviationMap.keys()) {
      const sourcesField = `
    <div class="checkbox">
    <label>
      <input checked data-filter-sources type="checkbox" value="${key}">
      ${key} (${sourceTypeNamesAndAbbreviationMap.get(key)})
    </label>
  </div>`;
      const docsField = `
  <div class="checkbox">
  <label>
    <input checked data-filter-docs type="checkbox" value="${key}">
    ${key} (${sourceTypeNamesAndAbbreviationMap.get(key)})
  </label>
</div>`;
      sourcesBoxFilters.innerHTML = sourcesBoxFilters.innerHTML + sourcesField;
      docsBoxFilters.innerHTML = docsBoxFilters.innerHTML + docsField;
    }
    listenerAllCheckboxsFilters();
  }

  function listenerAllCheckboxsFilters() {
    const sourcesInputFilters = document.querySelectorAll(
      '[data-filter-sources]'
    );
    const docsInputFilters = document.querySelectorAll('[data-filter-docs]');
    sourcesInputFilters.forEach((item) => {
      item.addEventListener('change', () => {
        if (item.checked) {
          sourcesFilters.push(item.value);
        } else {
          const index = sourcesFilters.indexOf(item.value);
          sourcesFilters.splice(index, 1);
        }
        sourcesFilters.sort();
        createChartSourcesByMonth(evolutionIndicators, diffOfMonths);
      });
    });
    docsInputFilters.forEach((item) => {
      item.addEventListener('change', () => {
        if (item.checked) {
          docsFilters.push(item.value);
        } else {
          const index = docsFilters.indexOf(item.value);
          docsFilters.splice(index, 1);
        }
        docsFilters.sort();
        createChartDocumentsByMonth(evolutionIndicators, diffOfMonths);
      });
    });
  }

  async function createChartSourcesByMonth(indicators, qtdOfMonths) {
    const values = indicators.map((item) => {
      const date = new Date(item.content.createdAt);
      return {
        date: truncateDateToDay(date),
        sourceType: getTranslatedText(item.content.sourceType),
        numberOfNetworks: item.content.numberOfNetworks,
      };
    });
    const width = qtdOfMonths * 50;
    const yourVlSpec = {
      data: {
        values: values,
      },
      config: {
        customFormatTypes: true,
      },
      width: width,
      transform: [
        {
          filter: {
            field: 'sourceType',
            oneOf: sourcesFilters,
          },
        },
      ],
      mark: {
        type: 'line',
        point: true,
        tooltip: true,
      },
      labelFontSize: 14,
      encoding: {
        x: {
          timeUnit: 'yearmonth',
          equal: 1,
          field: 'date',
          type: 'temporal',
          title: getTranslatedText('Month'),
          axis: {
            titleFontSize: 14,
            labelFontSize: 14,
            format: '%b',
          },
        },
        y: {
          aggregate: 'mean',
          field: 'numberOfNetworks',
          type: 'quantitative',
          title: getTranslatedText('Fontes'),
          axis: {
            titleFontSize: 14,
            labelFontSize: 14,
          },
        },
        color: {
          field: 'sourceType',
          type: 'nominal',
          title: getTranslatedText('Tipo de fonte'),
          legend: {
            titleFontSize: 14,
            labelFontSize: 14,
            formatType: 'formatGetInitials',
            labelExpr: 'datum.label',
          },
        },
        tooltip: [
          {
            field: 'date',
            type: 'temporal',
            timeUnit: 'yearmonth',
            title: getTranslatedText('Month'),
          },
          {
            field: 'sourceType',
            type: 'nominal',
            title: getTranslatedText('Tipo de fonte'),
          },
          {
            field: 'numberOfNetworks',
            type: 'quantitative',
            format: ',.0f',
            title: getTranslatedText('Fontes'),
          },
        ],
      },
    };
    vegaEmbed('#visSourceByMonth', yourVlSpec, vegaOptions);
  }

  async function createChartDocumentsByMonth(indicators, qtdOfMonths) {
    const values = indicators.map((item) => {
      const date = new Date(item.content.createdAt);
      return {
        date: truncateDateToDay(date),
        sourceType: getTranslatedText(item.content.sourceType),
        numberOfDocuments: item.content.numberOfDocuments,
      };
    });

    values.sort(function (a, b) {
      return a.sourceType - b.sourceType;
    });
    const width = qtdOfMonths * 50;
    const yourVlSpec = {
      data: {
        values: values,
      },
      config: {
        customFormatTypes: true,
      },
      width: width,
      transform: [
        {
          filter: {
            field: 'sourceType',
            oneOf: docsFilters,
          },
        },
      ],
      mark: {
        type: 'line',
        point: true,
        tooltip: true,
      },
      labelFontSize: 14,
      encoding: {
        x: {
          timeUnit: 'yearmonth',
          field: 'date',
          title: getTranslatedText('Month'),
          axis: {
            titleFontSize: 14,
            labelFontSize: 14,
            format: '%b',
          },
        },
        y: {
          aggregate: 'mean',
          field: 'numberOfDocuments',
          type: 'quantitative',
          title: getTranslatedText('Documentos'),
          axis: {
            titleFontSize: 14,
            labelFontSize: 14,
          },
        },
        color: {
          field: 'sourceType',
          type: 'nominal',
          title: getTranslatedText('Tipo de fonte'),
          legend: {
            titleFontSize: 14,
            labelFontSize: 14,
            formatType: 'formatGetInitials',
            labelExpr: 'datum.label',
          },
        },
        tooltip: [
          {
            field: 'date',
            type: 'evolution',
            timeUnit: 'yearmonth',
            title: getTranslatedText('Month'),
          },
          {
            field: 'sourceType',
            type: 'nominal',
            title: getTranslatedText('Tipo de fonte'),
          },
          {
            field: 'numberOfDocuments',
            type: 'quantitative',
            format: ',.0f',
            title: getTranslatedText('Documentos'),
          },
        ],
      },
    };
    vegaEmbed('#visDocumentsByMonth', yourVlSpec, vegaOptions);
  }

  function listenerDateChanges() {
    // gráfico evolution de fontes por mês
    // const sourceInitInput = document.querySelector('#sourceInit')
    // const sourceEndInput = document.querySelector('#sourceEnd')
    // gráfico evolution de documentos por mês
    const docInitInput = document.querySelector('#docInit');
    const docEndInput = document.querySelector('#docEnd');

    // se o navegador não suportar o tipo month alterar para tipo date
    let inputType = 'month';
    if (docInitInput.type != 'month') {
      inputType = 'date';
      // sourceInitInput.type = 'date'
      // sourceEndInput.type = 'date'
      docInitInput.type = 'date';
      docEndInput.type = 'date';
    }

    // setSourceDatesInitialValues(sourceInitInput, sourceEndInput, inputType)
    setDocDatesInitialValues(docInitInput, docEndInput, inputType);

    // listenerSourceInitDate(sourceInitInput)
    // listenerSourceEndDate(sourceEndInput)

    // listenerDocInitDate(docInitInput)
    // listenerDocEndDate(docEndInput)
    listenerDocDateChanges(docInitInput, docEndInput);
    // listenerSourceDateChanges(sourceInitInput, sourceEndInput)
  }

  function listenerDocDateChanges(docInitInput, docEndInput) {
    const btnDocsFind = document.querySelector('#btnDocsFind');
    const divMsg = document.querySelector('#msg');
    btnDocsFind.addEventListener('click', async () => {
      docInitDate = builInitDate(docInitInput.valueAsDate);
      docEndDate = buildEndDate(docEndInput.valueAsDate);
      const diffOfMonthsOld = diffOfMonths;
      diffOfMonths = monthDiff(docInitDate, docEndDate);
      if (
        docInitDate != null &&
        docEndDate != null &&
        (docInitDate.getTime() > docEndDate.getTime() ||
          diffOfMonths < 4 ||
          diffOfMonths > 12)
      ) {
        diffOfMonths = diffOfMonthsOld;
        addErrorMsg(divMsg);
      } else {
        evolutionIndicators = await getIndicatorsFromRemoteApiBy(
          `/evolution-indicators?init=${docInitDate}&end=${docEndDate}`
        );
        createChartDocumentsByMonth(evolutionIndicators, diffOfMonths);
        createChartSourcesByMonth(evolutionIndicators, diffOfMonths);
        removeMsgError(divMsg);
      }
    });
  }

  function removeMsgError(divMsg) {
    divMsg.innerHTML = '';
  }

  function addErrorMsg(divMsg) {
    divMsg.innerHTML = `<div class="alert alert-danger">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      Período selecionado inválido, selecione um período de 4 e 12 meses.
    </div>`;
  }

  // function listenerSourceDateChanges(sourceInitInput, sourceEndInput) {
  //   const btnSourcesFind = document.querySelector('#btnSourcesFind')
  //   btnSourcesFind.addEventListener('click', async () => {
  //     console.log('clicou')
  //     sourceInitDate = builInitDate(sourceInitInput.valueAsDate)
  //     sourceEndDate = buildEndDate(sourceEndInput.valueAsDate)
  //     if (
  //       sourceInitDate != null &&
  //       sourceEndDate != null &&
  //       (sourceInitDate.getTime() > sourceEndDate.getTime() ||
  //         monthDiff(sourceInitDate, sourceEndDate) < 4 ||
  //         monthDiff(sourceInitDate, sourceEndDate) > 12)
  //     ) {
  //       alert('Data inválida')
  //     } else {
  //       evolutionIndicators = await getIndicatorsFromRemoteApiBy(
  //         `/evolution-indicators?init=${sourceInitDate}&end=${sourceEndDate}`
  //       )
  //       updateSourcesDates()
  //     }
  //   })
  // }

  function monthDiff(d1, d2) {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  function setSourceDatesInitialValues(
    sourceInitInput,
    sourceEndInput,
    inputType
  ) {
    // os indicadores estão ordenados por data
    // campo de data incial recebe a data do primeiro indicador
    // campo de data final recebe a data do último indicador
    sourceInitDate = builInitDate(new Date(evolutionIndicators[0].createdAt));
    sourceEndDate = buildEndDate(
      new Date(evolutionIndicators[evolutionIndicators.length - 1].createdAt)
    );
    sourceInitInput.valueAsDate = sourceInitDate;
    sourceEndInput.valueAsDate = sourceEndDate;

    const minDate = getMinMaxDateFromInputType(
      new Date('2017-06-01').toISOString().split('T')[0],
      inputType
    );
    const maxDate = getMinMaxDateFromInputType(
      new Date().toISOString().split('T')[0],
      inputType
    );

    sourceInitInput.setAttribute('min', minDate);
    sourceInitInput.setAttribute('max', maxDate);

    sourceEndInput.setAttribute('min', minDate);
    sourceEndInput.setAttribute('max', maxDate);
  }

  function setDocDatesInitialValues(docInitInput, docEndInput, inputType) {
    // os indicadores estão ordenados por data
    // campo de data incial recebe a data do primeiro indicador
    // campo de data final recebe a data do último indicador
    docInitDate = builInitDate(new Date(evolutionIndicators[0].createdAt));
    docEndDate = buildEndDate(
      new Date(evolutionIndicators[evolutionIndicators.length - 1].createdAt)
    );
    docInitInput.valueAsDate = docInitDate;
    docEndInput.valueAsDate = docEndDate;

    const minDate = getMinMaxDateFromInputType(
      new Date('2017-06-01').toISOString().split('T')[0],
      inputType
    );
    const maxDate = getMinMaxDateFromInputType(
      new Date().toISOString().split('T')[0],
      inputType
    );

    docInitInput.setAttribute('min', minDate);
    docInitInput.setAttribute('max', maxDate);

    docEndInput.setAttribute('min', minDate);
    docEndInput.setAttribute('max', maxDate);
  }

  function getMinMaxDateFromInputType(date, inputType) {
    if (inputType == 'month') {
      const itens = date.split('-');
      return itens[0] + '-' + itens[1];
    }
    return date;
  }

  function buildEndDate(endDate) {
    const day = lastDayOfMonth(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth() + 1
    );
    return new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), day);
  }

  function builInitDate(initDate) {
    return new Date(initDate.getUTCFullYear(), initDate.getUTCMonth(), 1);
  }

  // function updateSourcesDates() {
  //   let indicatorsFiltered = evolutionIndicators
  //   if (sourceInitDate != null) {
  //     indicatorsFiltered = indicatorsFiltered.filter((indicator) => {
  //       return new Date(indicator.createdAt).getTime() > sourceInitDate.getTime()
  //     })
  //   }
  //   if (sourceEndDate != null) {
  //     indicatorsFiltered = indicatorsFiltered.filter((indicator) => {
  //       return new Date(indicator.createdAt).getTime() < sourceEndDate.getTime()
  //     })
  //   }
  //   createChartSourcesByMonth(indicatorsFiltered)
  // }

  // function updateDocsDates() {
  //   let indicatorsFiltered = evolutionIndicators
  //   if (docInitDate != null) {
  //     indicatorsFiltered = indicatorsFiltered.filter((indicator) => {
  //       return new Date(indicator.createdAt).getTime() > docInitDate.getTime()
  //     })
  //   }
  //   if (docEndDate != null) {
  //     indicatorsFiltered = indicatorsFiltered.filter((indicator) => {
  //       return new Date(indicator.createdAt).getTime() < docEndDate.getTime()
  //     })
  //   }
  //   createChartDocumentsByMonth(indicatorsFiltered)
  // }

  evolutionIndicators = await getIndicatorsFromRemoteApiBy(
    '/evolution-indicators'
  );
  fillSourceTypeNamesAndAbbreviationMap();
  createChartSourcesByMonth(evolutionIndicators, diffOfMonths);
  createChartDocumentsByMonth(evolutionIndicators, diffOfMonths);
  listenerDateChanges();
  createCheckboxsFilters();
});
