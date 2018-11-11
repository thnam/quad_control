var socket = io.connect(baseUrl);

function formatVC(val) {
  return(Math.abs(parseFloat(val)));
}

socket.on("cv", (data) => {
  const values = data.cv;

  // update the voltages and currents first
  window.vRead = values[0].meta;
  // spark alert
  if (window.vRead.spark >= 2) {
    if (window.ramping) {
      window.ramping = false;
      handleSparkEvent("Spark! Ramping is aborted.");
    } else {
      handleSparkEvent("Spark!");
    }
  }

  var lastCvValue = [
    formatVC(window.vRead.os.pv), formatVC(window.vRead.os.nv), 
    formatVC(window.vRead.ss.pv), formatVC(window.vRead.ss.nv), 
    formatVC(window.vRead.fs.pv), formatVC(window.vRead.fs.nv)];

  window.lastCvBarChartData[0].x = lastCvValue;
  window.lastCvBarChartData[0].text = lastCvValue;

  Plotly.redraw(document.getElementById('bcLastCV'));


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

function initCVCharts() {
  initLastCVBarChart();
  initCVTrendLineChart();
};

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

function initCVTrendLineChart() {
  var layout = {
    title: 'Voltage and current trend plot',
    margin: { l: 40, r: 40, b: 40, t: 40, pad: 4 },
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Voltage [kV]', range: [0, 30]},
    yaxis2: {
      title: 'Current [mA]',
      titlefont: {color: 'rgb(148, 103, 189)'},
      tickfont: {color: 'rgb(148, 103, 189)'},
      overlaying: 'y',
      side: 'right',
      range: [0, 3]
    },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  var vTrace0 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[0]}, name: "PVOS", line: {dash: "solid"}};
  var vTrace1 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[1]}, name: "NVOS", line: {dash: "solid"}};
  var vTrace2 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[2]}, name: "PVSS", line: {dash: "solid"}};
  var vTrace3 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[3]}, name: "NVSS", line: {dash: "solid"}};
  var vTrace4 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[4]}, name: "PVFS", line: {dash: "solid"}};
  var vTrace5 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[5]}, name: "NVFS", line: {dash: "solid"}};

  var cTrace0 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[0]}, name: "PVOS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace1 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[1]}, name: "NVOS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace2 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[2]}, name: "PVSS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace3 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[3]}, name: "NVSS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace4 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[4]}, name: "PVFS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace5 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[5]}, name: "NVFS", line: {dash: "dot"}, yaxis: 'y2'};
  window.cvTrendData = [
    vTrace0, vTrace1, vTrace2, vTrace3, vTrace4, vTrace5,
    cTrace0, cTrace1, cTrace2, cTrace3, cTrace4, cTrace5
  ];

  Plotly.newPlot(document.getElementById('lcCVTrend'),
    window.cvTrendData, layout, {responsive: true});
}

