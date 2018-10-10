function initPSCharts() {
  initPSTrendLineChart();
}

function initPSTrendLineChart() {
  var layout = {
    title: 'Pulser status trend',
    // font:{ family: 'Raleway, sans-serif' },
    showlegend: false,
    // xaxis: { tickangle: -45 },
    // yaxis: { zeroline: true, gridwidth: 2 },
    yaxis: {title: 'Logic level'},
    // bargap :0.1,
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    plot_bgcolor: 'rgba(0, 0, 0, 0)'
  };

  var vTrace0 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[0]}, name: "POS", line: {dash: "solid"}};
  var vTrace1 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[1]}, name: "NOS", line: {dash: "solid"}};
  var vTrace2 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[0]}, name: "PTS", line: {dash: "solid"}};
  var vTrace3 = {x: [], y: [], mode: 'lines+markers', marker: {color: plotColor[1]}, name: "NTS", line: {dash: "solid"}};
  window.psTrendData = [
    vTrace0, vTrace1, vTrace2, vTrace3
  ];

  Plotly.newPlot(document.getElementById('lcPSTrend'),
    window.psTrendData, layout, {responsive: true});
}

