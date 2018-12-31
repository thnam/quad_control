var socket = io.connect(baseUrl);
socket.on("pulserStatus", (data) => {
  const values = data.pulserStatus;
  displayPulserStatus(values[0].meta);

  let len = values.length;
  var timestamp = [];
  var trace = [[], [], [], []];

  for (var i = len - 1; i >= 0; i--) {
    var ps = values[i].meta;
    try {
      timestamp.push(new Date(values[i].timestamp));
      trace[0].push(parseFloat(ps.pos.fault) + 0.03);
      trace[1].push(parseFloat(ps.nos.fault) + 0.01);
      trace[2].push(parseFloat(ps.pts.fault) + -0.01);
      trace[3].push(parseFloat(ps.nts.fault) + -0.03);
    } catch (e) {
      /* handle error */
    }

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

function displayPulserStatus(data) {
  let statTable = document.getElementById("pulserStatusTable");
  let ps = ["pos", "nos", "pts", "nts"];
  // let stat = ["enabled", "interlock", "enabled"];

  let row = statTable.rows[1]; // enabled
  for (var i = 0, len = ps.length; i < len; i++) {
    if (data[ps[i]]["enabled"]) {
      row.cells[i].innerHTML = "Enabled";
      row.cells[i].classList.add("table-success");
    }
    else{
      row.cells[i].innerHTML = "Disabled";
      row.cells[i].classList.add("table-danger");
    }
  }

  row = statTable.rows[2]; // interlock
  for (var i = 0, len = ps.length; i < len; i++) {
    if (data[ps[i]]["interlock"]) {
      row.cells[i].innerHTML = "Interlocked";
      row.cells[i].classList.add("table-success");
    }
    else{
      row.cells[i].innerHTML = "Not interlocked";
      row.cells[i].classList.add("table-danger");
    }
  }

  row = statTable.rows[3]; // fault
  for (var i = 0, len = ps.length; i < len; i++) {
    if (data[ps[i]]["fault"]) {
      row.cells[i].innerHTML = "Faulted";
      row.cells[i].classList.add("table-danger");
    }
    else{
      row.cells[i].innerHTML = "No fault";
      row.cells[i].classList.add("table-success");
    }
  }
}
