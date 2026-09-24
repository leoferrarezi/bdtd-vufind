function fillTotalDocuments(total) {
  const totalDocsElements = document.querySelectorAll('#total-docs');
  totalDocsElements.forEach((element) => {
    element.textContent = formatNumber(total);
  });
}

async function createChartByYear(data) {
  let values = data.map((item) => {
    return { year: item.translated, count: item.count };
  });

  values.sort(function (a, b) {
    return a.year - b.year;
  });

  values = values.slice(values.length - 10, values.length);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'bar', tooltip: true, color: '#008e67' },
    width: 460,
    // height: 250,
    encoding: {
      x: {
        field: 'year',
        type: 'nominal',
        title: null,
        axis: { labelAngle: 0, labelFontSize: 14 },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: null,
        axis: {
          labelFontSize: 14,
        },
      },
      tooltip: [
        { field: 'year', type: 'nominal', title: 'Ano' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visYear', yourVlSpec, vegaOptions);
}

async function createChartByType(data) {
  const values = data.map((item) => {
    return { type: getTranslatedText(item.translated), count: item.count };
  });

  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'arc', tooltip: true },
    view: { stroke: null },
    encoding: {
      theta: { field: 'count', type: 'quantitative', stack: true },
      color: {
        field: 'type',
        type: 'nominal',
        legend: {
          title: null,
          labelFontSize: 14,
        },
      },
      tooltip: [
        { field: 'type', type: 'nominal', title: 'Tipo de documento' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visType', yourVlSpec, vegaOptions);
}

async function createChartByInstitution(data) {
  let values = data.map((item) => {
    return { inst: item.translated, count: item.count };
  });

  values = values.slice(0, 10);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'bar', tooltip: true, color: '#008e67' },
    width: 460,
    labelFontSize: 14,
    encoding: {
      x: {
        field: 'inst',
        type: 'nominal',
        title: null,
        axis: { labelAngle: 45, labelFontSize: 14 },
        sort: { field: 'count', order: 'descending' },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: null,
        axis: { labelFontSize: 14 },
      },
      tooltip: [
        { field: 'inst', type: 'nominal', title: 'Instituição' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visInst', yourVlSpec, vegaOptions);
}

async function createChartByLanguage(data) {
  let values = data.map((item) => {
    return {
      language: item.translated ? getTranslatedText(item.translated) : 'Others',
      count: item.count,
    };
  });
  values = values.slice(0, 5);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'arc', tooltip: true, innerRadius: 50 },
    view: { stroke: null },
    encoding: {
      theta: { field: 'count', type: 'quantitative', stack: true },
      color: {
        field: 'language',
        type: 'nominal',
        legend: {
          title: null,
          labelFontSize: 14,
        },
      },
      tooltip: [
        { field: 'language', type: 'nominal', title: 'Idioma' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visLang', yourVlSpec, vegaOptions);
}

async function createChartByAuthor(data) {
  let values = data.map((item) => {
    return { author: item.translated, count: item.count };
  });
  values = values.slice(0, 10);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'bar', color: '#008e67' },
    width: 460,
    // height: 250,
    labelFontSize: 14,
    transform: [
      {
        filter: 'datum.author != "sem informação"',
      },
    ],
    encoding: {
      x: {
        field: 'author',
        type: 'nominal',
        title: null,
        axis: { labelAngle: 45, labelFontSize: 14 },
        sort: { field: 'value', order: 'descending' },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: null,
        axis: { labelFontSize: 14 },
      },
      tooltip: [
        { field: 'author', type: 'nominal', title: 'Autor' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visAuthor', yourVlSpec, vegaOptions);
}

async function createChartByAdvisors(data) {
  let values = data.map((item) => {
    return { advisor: item.translated, count: item.count };
  });
  values = values.slice(0, 10);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'bar', color: '#008e67' },
    width: 460,
    // height: 250,
    transform: [
      {
        filter: 'datum.advisor != "sem informação"',
      },
    ],
    labelFontSize: 14,
    encoding: {
      x: {
        field: 'advisor',
        type: 'nominal',
        title: null,
        axis: { labelAngle: 45, labelFontSize: 14 },
        sort: { field: 'value', order: 'descending' },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: null,
        axis: { labelFontSize: 14 },
      },
      tooltip: [
        { field: 'advisor', type: 'nominal', title: 'Orientador' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visAdv', yourVlSpec, vegaOptions);
}

async function createWordCloud(data, lookfor, type) {
  // data = data.slice(0, 10)

  const values = [];
  let divisor = 2;
  if (data[0].count > 10000) {
    divisor = 1000;
  } else if (data[0].count > 5000) {
    divisor = 500;
  } else if (data[0].count > 3000) {
    divisor = 300;
  } else if (data[0].count > 2000) {
    divisor = 200;
  } else if (data[0].count > 1000) {
    divisor = 100;
  } else if (data[0].count < 10) {
    divisor = 0.3;
  }
  data.forEach((item) => {
    values.push([item.translated, item.count / divisor, item.count]);
  });

  // const tippyElement = tippy('#cloudTopic', {
  //   trigger: 'manual'
  // })

  const tippyElement = tippy(document.querySelector('#cloudTopic'), {
    trigger: 'manual',
  });
  const visAuthor = document.getElementById('cloudTopic');
  const options = {
    list: values,
    gridSize: 16,
    color: 'random-light',
    weightFactor: 3,
    fontFamily: 'Lato, sans-serif',
    color: '#000',
    click: function (item) {
      let search = '/vufind/Search/Results?';
      if (lookfor && type) {
        search = search + `lookfor=${lookfor}&type=${type}&`;
      }
      search =
        search + `filter%5B%5D=dc.subject.por.fl_str_mv%3A%22${item[0]}%22`;
      window.location = search;
    },
    hover: function (item, dimension) {
      tippyElement.setContent(item[0] + ': ' + formatNumber(item[2]));
      // tippyElement.setProps({
      //   getReferenceClientRect: () => ({
      //     width: dimension.w,
      //     height: dimension.h,
      //     left: visAuthor.offsetLeft + dimension.w + dimension.x,
      //     top: visAuthor.offsetTop + dimension.h + dimension.y
      //   })
      // })
      tippyElement.show();
    },
    backgroundColor: '#FFF',
  };

  WordCloud(visAuthor, options);
}

async function createChartByPpg(data) {
  let values = data.map((item) => {
    return { PPG: item.translated, count: item.count };
  });
  values = values.slice(0, 10);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'bar', tooltip: true, color: '#008e67' },
    width: 460,
    labelFontSize: 14,
    encoding: {
      x: {
        field: 'PPG',
        type: 'nominal',
        title: null,
        axis: { labelAngle: 45, labelFontSize: 14 },
        sort: { field: 'count', order: 'descending' },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: null,
        axis: { labelFontSize: 14 },
      },
      tooltip: [
        { field: 'PPG', type: 'nominal', title: 'PPG' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visPpg', yourVlSpec, vegaOptions);
}

async function createChartByRights(data) {
  const values = data.map((item) => {
    return {
      right: getTranslatedText(item.translated),
      count: item.count,
    };
  });
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'arc', tooltip: true },
    view: { stroke: null },
    encoding: {
      theta: { field: 'count', type: 'quantitative', stack: true },
      color: {
        field: 'right',
        type: 'nominal',
        legend: {
          title: null,
          labelFontSize: 14,
        },
      },
      tooltip: [
        { field: 'right', type: 'nominal', title: 'Tipo de acesso' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visRights', yourVlSpec, vegaOptions);
}

function cleanCNPqTag(fullTag) {
  const split = fullTag.split('::');
  return split[split.length - 1];
}

async function createChartByCnpq(data) {
  let values = data.map((item) => {
    return { CNPq: cleanCNPqTag(item.translated), count: item.count };
  });
  values = values.slice(0, 10);
  const yourVlSpec = {
    data: {
      values: values,
    },
    mark: { type: 'bar', tooltip: true, color: '#008e67' },
    width: 460,
    // height: 250,
    labelFontSize: 14,
    encoding: {
      x: {
        field: 'CNPq',
        type: 'nominal',
        title: null,
        axis: {
          labelAngle: 45,
          labelFontSize: 14,
        },
        sort: { field: 'count', order: 'descending' },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: null,
        axis: {
          labelFontSize: 14,
        },
      },
      tooltip: [
        { field: 'CNPq', type: 'nominal', title: 'Área do conhecimento' },
        {
          field: 'count',
          type: 'quantitative',
          format: ',.0f',
          title: getTranslatedText('Count'),
        },
      ],
    },
  };
  vegaEmbed('#visCnpq', yourVlSpec, vegaOptions);
}

function filterFormListener() {
  const form = document.querySelector('[data-form-filter]');
  if (form.attachEvent) {
    form.attachEvent('submit', processForm);
  } else {
    form.addEventListener('submit', processForm);
  }
}

function processForm(e) {
  if (e.preventDefault) e.preventDefault();
  loadData(this.elements.filter.value, this.elements.type.value);
  return false;
}

document.addEventListener('DOMContentLoaded', async () => {
  filterFormListener();
  await loadData(null, null);
});

async function loadData(lookfor, type) {
  const initTime = performance.now();
  const indicators = await getIndicatorsFromVufindApi(lookfor, type);
  const endTime = performance.now();
  fillSearchResults(lookfor, indicators, type, endTime, initTime);
  createChartByYear(indicators.facets.publishDate);
  createChartByType(indicators.facets.format);
  createChartByInstitution(indicators.facets.institution);
  createChartByLanguage(indicators.facets.language);
  createChartByAuthor(indicators.facets.author_facet);
  createChartByAdvisors(indicators.facets['dc.contributor.advisor1.fl_str_mv']);
  createWordCloud(indicators.facets['dc.subject.por.fl_str_mv'], lookfor, type);
  createChartByRights(indicators.facets.eu_rights_str_mv);
  createChartByCnpq(indicators.facets['dc.subject.cnpq.fl_str_mv']);
  createChartByPpg(indicators.facets['dc.publisher.program.fl_str_mv']);
}
function fillSearchResults(lookfor, indicators, type, endTime, initTime) {
  if (!lookfor) {
    // só pega o total sem filtro
    fillTotalDocuments(indicators.resultCount);
    results.style.display = 'none';
  } else {
    const results = document.getElementById('results');
    results.style.display = 'block';
    const resultTotal = document.getElementById('total-docs-results');
    resultTotal.textContent = formatNumber(indicators.resultCount);

    const filtersSearch = document.getElementById('filters-search');
    let filters = '';
    if (type) {
      filters = `por ${getTranslatedText(type)} `;
    }
    filters = filters + `"${lookfor}"`;
    filtersSearch.textContent = filters;

    const timeSearch = document.getElementById('time-search');
    timeSearch.textContent = `${formatNumber((endTime - initTime) / 1000)}s`;
  }
}
