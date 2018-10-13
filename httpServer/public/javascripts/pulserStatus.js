var socket = io.connect(baseUrl);
socket.on("pulserStatus", (data) => {
  const values = data.pulserStatus;

  let len = values.length;
  var timestamp = [];
  var trace = [[], [], [], []];

  for (var i = len - 1; i >= 0; i--) {
    var ps = JSON.parse(values[i].message);

    timestamp.push(new Date(values[i].timestamp));
    trace[0].push(parseFloat(ps.pos.fault) + 0.03);
    trace[1].push(parseFloat(ps.nos.fault) + 0.01);
    trace[2].push(parseFloat(ps.pts.fault) + -0.01);
    trace[3].push(parseFloat(ps.nts.fault) + -0.03);
  };

  for (var i = 0; i < 4; i++) {
    window.psTrendData[i].x = timestamp;
    window.psTrendData[i].y = trace[i];
  };

  Plotly.redraw(document.getElementById("lcPSTrend"));
});

function initPSCharts() {
  initPSTrendLineChart();
};

function volt2Logic(number, offset){
  if (parseFloat(number) >= 3.5) {
    return 1 + offset;
  }
  else
    return 0 + offset;
};

function initPSTrendLineChart() {
  var layout = {
    title: 'Pulser status trend',
    // font:{ family: 'Raleway, sans-serif' },
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Logic level', range: [-0.1, 1.1]},
    // bargap :0.1,
    legend: {"orientation": "h"},
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  var vTrace0 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[0]}, name: "POS", line: {dash: "solid"}};
  var vTrace1 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[1]}, name: "NOS", line: {dash: "solid"}};
  var vTrace2 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[2]}, name: "PTS", line: {dash: "solid"}};
  var vTrace3 = {x: [], y: [], mode: 'lines', marker: {color: plotColor[3]}, name: "NTS", line: {dash: "solid"}};
  window.psTrendData = [
    vTrace0, vTrace1, vTrace2, vTrace3
  ];

  Plotly.newPlot(document.getElementById('lcPSTrend'),
    window.psTrendData, layout, {responsive: true});
}

