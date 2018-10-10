var socket = io.connect(baseUrl);
socket.on("cv", (data) => {
  const values = data.cv;

  // update the voltages and currents first
  const lastCV = JSON.parse(values[0].message);

  // window.lastCVChartData.datasets[0].data = [
  var lastCvValue = [
    parseFloat(lastCV.os.pv),
    Math.abs(parseFloat(lastCV.os.nv)), 
    parseFloat(lastCV.ss.pv),
    Math.abs(parseFloat(lastCV.ss.nv)), 
    parseFloat(lastCV.fs.pv),
    Math.abs(parseFloat(lastCV.fs.nv))];

  window.lastCvBarChartData[0].y = lastCvValue;
  window.lastCvBarChartData[0].text = lastCvValue;

  Plotly.redraw(document.getElementById('bcLastCV'));

  // then cv table
  //
  let len = values.length;
  var timestamp = [];
  var cTrace = [[], [], [], [], [], []];

  for (var i = len - 1; i >= 0; i--) {
    var cv = JSON.parse(values[i].message);

    timestamp.push(values[i].timestamp);
    cTrace[0].push(parseFloat(cv.os.pv));
    cTrace[1].push(Math.abs(parseFloat(cv.os.nv)));
    cTrace[2].push(parseFloat(cv.ss.pv));
    cTrace[3].push(Math.abs(parseFloat(cv.ss.nv)));
    cTrace[4].push(parseFloat(cv.fs.pv));
    cTrace[5].push(Math.abs(parseFloat(cv.fs.nv)));
  };

  timestamp.forEach((element)=>{
    let newElement = moment().set(element).format("YYYY-MM-DD HH:mm:ss");
    element = newElement;
  });
  // console.log(formatter.format(timestamp[0]));

  for (var i = 0; i < 6; i++) {
    window.cvTrendData[i].x = timestamp;
    window.cvTrendData[i].y = cTrace[i];
  };

  Plotly.redraw(document.getElementById("lcCVTrend"));
})

function initCVCharts() {
  initLastCVBarChart();
  initCVTrendLineChart();
};

plotColor = [
  '#ff7f0e',  // safety orange
  '#1f77b4',  // muted blue
  '#d62728',  // brick red
  '#2ca02c',  // cooked asparagus green
  '#e377c2',  // raspberry yogurt pink
  '#17becf',   // blue-teal
  '#8c564b',  // chestnut brown
  '#9467bd',  // muted purple
  '#7f7f7f',  // middle gray
  '#bcbd22',  // curry yellow-green
];

function initLastCVBarChart() {
  var layout = {
    title: 'Last voltage readout',
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  var lastCvValue = [0, 0, 0, 0, 0, 0];
  window.lastCvBarChartData = [{
    x: ["PVOS", "NVOS", "PVSS", "NVSS", "PVFS", "NVFS"],
    y: lastCvValue,
    marker: { color: plotColor },
    type: 'bar',
    textposition: 'auto',
    hoverinfo: 'none',
    text: lastCvValue,
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
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Voltage [kV]'},
    yaxis2: {
      title: 'Current [mA]',
      titlefont: {color: 'rgb(148, 103, 189)'},
      tickfont: {color: 'rgb(148, 103, 189)'},
      overlaying: 'y',
      side: 'right'
    },
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  var vTrace0 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[0]}, name: "PVOS", line: {dash: "solid"}};
  var vTrace1 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[1]}, name: "NVOS", line: {dash: "solid"}};
  var vTrace2 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[2]}, name: "PVSS", line: {dash: "solid"}};
  var vTrace3 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[3]}, name: "NVSS", line: {dash: "solid"}};
  var vTrace4 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[4]}, name: "PVFS", line: {dash: "solid"}};
  var vTrace5 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[5]}, name: "NVFS", line: {dash: "solid"}};

  var cTrace0 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[0]}, name: "PVOS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace1 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[1]}, name: "NVOS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace2 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[2]}, name: "PVSS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace3 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[3]}, name: "NVSS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace4 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[4]}, name: "PVFS", line: {dash: "dot"}, yaxis: 'y2'};
  var cTrace5 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[5]}, name: "NVFS", line: {dash: "dot"}, yaxis: 'y2'};
  window.cvTrendData = [
    vTrace0, vTrace1, vTrace2, vTrace3, vTrace4, vTrace5,
    cTrace0, cTrace1, cTrace2, cTrace3, cTrace4, cTrace5
  ];

  Plotly.newPlot(document.getElementById('lcCVTrend'),
    window.cvTrendData, layout, {responsive: true});
}

