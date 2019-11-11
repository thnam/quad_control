// var socket = io.connect(baseUrl);

function formatVC(val) {
  return(Math.abs(parseFloat(val)));
}

window.cvLongTermData = [];
window.cvShortTermData = [];
window.cvTrendData = [];

socket.on("cv", (data) => {
  const values = data.cv;

  // update the voltages and currents first
  window.vRead = values[0].meta;
  // spark alert --> no longer working if BU controller takes over
  // if (window.vRead.spark >= 2) {
  // if (window.ramping) {
  // window.ramping = false;
  // handleSparkEvent("Spark! Ramping is aborted.");
  // } else {
  // handleSparkEvent("Spark!");
  // }
  // }

  var lastCvValue = [
    formatVC(window.vRead.os.pv), formatVC(window.vRead.os.nv), 
    formatVC(window.vRead.ss.pv), formatVC(window.vRead.ss.nv), 
    formatVC(window.vRead.fs.pv), formatVC(window.vRead.fs.nv)];

  document.getElementById("lfspv").innerHTML = window.vRead.fs.pv;
  document.getElementById("lfsnv").innerHTML = window.vRead.fs.nv;
  document.getElementById("lfspc").innerHTML = window.vRead.fs.pc;
  document.getElementById("lfsnc").innerHTML = window.vRead.fs.nc;
  document.getElementById("lsspv").innerHTML = window.vRead.ss.pv;
  document.getElementById("lssnv").innerHTML = window.vRead.ss.nv;
  document.getElementById("lsspc").innerHTML = window.vRead.ss.pc;
  document.getElementById("lssnc").innerHTML = window.vRead.ss.nc;
  document.getElementById("lospv").innerHTML = window.vRead.os.pv;
  document.getElementById("losnv").innerHTML = window.vRead.os.nv;
  document.getElementById("lospc").innerHTML = window.vRead.os.pc;
  document.getElementById("losnc").innerHTML = window.vRead.os.nc;
  // window.lastCvBarChartData[0].x = lastCvValue;
  // window.lastCvBarChartData[0].text = lastCvValue;

  // Plotly.redraw(document.getElementById('bcLastCV'));


  // then cv table
  //
  let len = values.length;
  var time = [];
  var cTrace = [[], [], [], [], [], []];
  var vTrace = [[], [], [], [], [], []];

  for (var i = len - 1; i >= 0; i--) {
    var cv = values[i].meta;

    time.push(new Date(values[i].timestamp));
    vTrace[0].push(formatVC(cv.os.pv));
    vTrace[1].push(formatVC(cv.os.nv));
    vTrace[2].push(formatVC(cv.ss.pv));
    vTrace[3].push(formatVC(cv.ss.nv));
    vTrace[4].push(formatVC(cv.fs.pv));
    vTrace[5].push(formatVC(cv.fs.nv));

    cTrace[0].push(formatVC(cv.os.pc));
    cTrace[1].push(formatVC(cv.os.nc));
    cTrace[2].push(formatVC(cv.ss.pc));
    cTrace[3].push(formatVC(cv.ss.nc));
    cTrace[4].push(formatVC(cv.fs.pc));
    cTrace[5].push(formatVC(cv.fs.nc));
  };

  for (var i = 0; i < 6; i++) {
    window.cvTrendData[i].x = time;
    window.cvTrendData[i].y = vTrace[i];
  };
  for (var i = 0; i < 6; i++) {
    window.cvTrendData[i + 6].x = time;
    window.cvTrendData[i + 6].y = cTrace[i];
  };

  Plotly.redraw(document.getElementById("lcCVTrend"));
})

socket.on("shortAvgCV", (data) => {
  const values = data.cv;
  redrawCVPlot(values, window.cvShortTermData, "lcCVTrendShortterm");
});

socket.on("longAvgCV", (data) => {
  const values = data.cv;
  redrawCVPlot(values, window.cvLongTermData, "lcCVTrendLongterm");
});

function initCVCharts() {
  // initLastCVBarChart();
  initCVTrendLineChart();
  initShortTermCVPlot();
  initLongTermCVPlot();
  drawShortTermCVTrendAtLoad();
  drawLongTermCVTrendAtLoad();
};

cvPlotVoltageRange = [0, 23];
cvPlotCurrentRange = [0, 10];

function initCVTrendLineChart() {
  var layout = {
    title: 'Voltage and current trend plot',
    margin: { l: 40, r: 40, b: 40, t: 40, pad: 4 },
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Voltage [kV]', range: cvPlotVoltageRange},
    yaxis2: {
      title: 'Current [mA]',
      titlefont: {color: 'rgb(148, 103, 189)'},
      tickfont: {color: 'rgb(148, 103, 189)'},
      overlaying: 'y',
      side: 'right',
      range: cvPlotCurrentRange
    },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  initPlotlyPlot(window.cvTrendData, "lcCVTrend", layout, false);
}

function initShortTermCVPlot() {
  var layout = {
    width: 1100,
    height: 550,
    margin: { l: 40, r: 40, b: 40, t: 40, pad: 4 },
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Voltage [kV]',automargin: true, range: cvPlotVoltageRange},
    yaxis2: {
      title: 'Current [mA]',
      titlefont: {color: 'rgb(148, 103, 189)'},
      tickfont: {color: 'rgb(148, 103, 189)'},
      overlaying: 'y',
      side: 'right',
      automargin: true,
      range: cvPlotCurrentRange
    },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  initPlotlyPlot(window.cvShortTermData, "lcCVTrendShortterm", layout, true);
}

function initLongTermCVPlot() {
  var layout = {
    width: 1100,
    height: 550,
    margin: { l: 40, r: 40, b: 40, t: 40, pad: 4 },
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Voltage [kV]',automargin: true, range: cvPlotVoltageRange},
    yaxis2: {
      title: 'Current [mA]',
      titlefont: {color: 'rgb(148, 103, 189)'},
      tickfont: {color: 'rgb(148, 103, 189)'},
      overlaying: 'y',
      side: 'right',
      automargin: true,
      range: cvPlotCurrentRange
    },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  initPlotlyPlot(window.cvLongTermData, "lcCVTrendLongterm", layout, true);
}

function drawShortTermCVTrendAtLoad() {
  $.ajax({
    type: 'GET',
    url: baseUrl + "/avgCV",
    data: {period: 20, npoints: 3 * 60 * 2},
    success : (data) => {
      redrawCVPlot(data, window.cvShortTermData, "lcCVTrendShortterm");
    },
    error: (err, stat) =>{
      console.error("Could not get avg CV data");
    }
  });
};

function drawLongTermCVTrendAtLoad() {
  $.ajax({
    type: 'GET',
    url: baseUrl + "/avgCV",
    data: {period: 60, npoints: 1 * 60 * 24 * 2},
    success : (data) => {
      redrawCVPlot(data, window.cvLongTermData, "lcCVTrendLongterm");
    },
    error: (err, stat) =>{
      console.error("Could not get avg CV data");
    }
  });
};

function redrawCVPlot(values, series, plotId) {
  let len = values.length;
  var time = [];
  var cTrace = [[], [], [], [], [], []];
  var vTrace = [[], [], [], [], [], []];

  for (var i = len - 1; i >= 0; i--) {
    var cv = values[i];

    time.push(new Date(values[i]._id));
    vTrace[0].push(cv.ospv);
    vTrace[1].push(cv.osnv);
    vTrace[2].push(cv.sspv);
    vTrace[3].push(cv.ssnv);
    vTrace[4].push(cv.fspv);
    vTrace[5].push(cv.fsnv);

    cTrace[0].push(cv.ospc);
    cTrace[1].push(cv.osnc);
    cTrace[2].push(cv.sspc);
    cTrace[3].push(cv.ssnc);
    cTrace[4].push(cv.fspc);
    cTrace[5].push(cv.fsnc);
  };

  for (var i = 0; i < 6; i++) {
    series[i].x = time;
    series[i].y = vTrace[i];
  };
  for (var i = 0; i < 6; i++) {
    series[i + 6].x = time;
    series[i + 6].y = cTrace[i];
  };

  Plotly.redraw(document.getElementById(plotId));
};

function initPlotlyPlot(series, plotId, layout, static) {
  var vTrace0 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[0]}, name: "PVOS", line: {dash: "solid"}};
  var vTrace1 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[1]}, name: "NVOS", line: {dash: "solid"}};
  var vTrace2 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[2]}, name: "PVSS", line: {dash: "solid"}};
  var vTrace3 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[3]}, name: "NVSS", line: {dash: "solid"}};
  var vTrace4 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[4]}, name: "PVFS", line: {dash: "solid"}};
  var vTrace5 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[5]}, name: "NVFS", line: {dash: "solid"}};

  var cTrace0 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[0]}, name: "PCOS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace1 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[1]}, name: "NCOS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace2 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[2]}, name: "PCSS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace3 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[3]}, name: "NCSS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace4 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[4]}, name: "PCFS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace5 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[5]}, name: "NCFS", line: {dash: "dot"}, yaxis: 'y2'};
  series.push( 
    vTrace0, vTrace1, vTrace2, vTrace3, vTrace4, vTrace5,
    cTrace0, cTrace1, cTrace2, cTrace3, cTrace4, cTrace5
  );

  if (static) {
    Plotly.newPlot(document.getElementById(plotId), series,
      layout, {staticPlot: true});
  }
  else
    Plotly.newPlot(document.getElementById(plotId), series,
      layout, {interactive: true});
}

function initLastCVBarChart() {
  var layout = {
    title: 'Last voltage readout',
    margin: { l: 40, r: 10, b: 40, t: 40, pad: 4 },
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    xaxis: {title: 'Voltage [kV]', range: [0, 25]},
    // yaxis: { zeroline: true, gridwidth: 2 },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  var lastCvValue = [0, 0, 0, 0, 0, 0];
  window.lastCvBarChartData = [{
    x: lastCvValue,
    y: ["PVOS", "NVOS", "PVSS", "NVSS", "PVFS", "NVFS"],
    marker: { color: plotColor },
    type: 'bar',
    textposition: 'auto',
    hoverinfo: 'none',
    text: lastCvValue,
    orientation: 'h',
    // text: [
    // "One Step Positive Voltage", "One Step Negative Voltage",
    // "Second Step Positive Voltage", "Second Step Negative Voltage",
    // "First Step Positive Voltage", "First Step Negative Voltage",]
  }];

  Plotly.newPlot(document.getElementById('bcLastCV'),
    window.lastCvBarChartData, layout, {responsive: true});
}
