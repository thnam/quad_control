var socket = io.connect(baseUrl);
socket.on("cv", (data) => {
  const values = data.cv;

  // update the voltages and currents first
  const lastCV = JSON.parse(values[0].message);

  window.lastCVChartData.datasets[0].data = [
    parseFloat(lastCV.os.pv),
    Math.abs(parseFloat(lastCV.os.nv)), 
    parseFloat(lastCV.ss.pv),
    Math.abs(parseFloat(lastCV.ss.nv)), 
    parseFloat(lastCV.fs.pv),
    Math.abs(parseFloat(lastCV.fs.nv))];

  window.chartLastCV.update();
  // then cv table
  //

  if (!window.cvChartInited) {
    window.cvChartInited = true;
    let len = values.length;
    for (var i = len -1; i == 0; i--) {
      let cv = JSON.parse(values[i].message);
      let tstamp = values[i].timestamp;

      window.cvChartData.labels.push(tstamp);
      window.cvChartData.datasets[0].data.push(parseFloat(cv.os.pv));
      window.cvChartData.datasets[1].data.push(Math.abs(parseFloat(cv.os.nv)));
      window.cvChartData.datasets[2].data.push(parseFloat(cv.ss.pv));
      window.cvChartData.datasets[3].data.push(Math.abs(parseFloat(cv.ss.nv)));
      window.cvChartData.datasets[4].data.push(parseFloat(cv.fs.pv));
      window.cvChartData.datasets[5].data.push(Math.abs(parseFloat(cv.fs.nv)));
    }
  }
  else
  {
      window.cvChartData.labels.push(values[0].timestamp);
      window.cvChartData.datasets[0].data.push(parseFloat(lastCV.os.pv));
      window.cvChartData.datasets[1].data.push(Math.abs(parseFloat(lastCV.os.nv)));
      window.cvChartData.datasets[2].data.push(parseFloat(lastCV.ss.pv));
      window.cvChartData.datasets[3].data.push(Math.abs(parseFloat(lastCV.ss.nv)));
      window.cvChartData.datasets[4].data.push(parseFloat(lastCV.fs.pv));
      window.cvChartData.datasets[5].data.push(Math.abs(parseFloat(lastCV.fs.nv)));
  }

  window.chartCV.update();
})

// no fill plz
Chart.defaults.global.elements.line.fill = false;
window.cvChartInited = false;

function initCharts() {
  initCVChart();
  initLastCVChart();
};

function initLastCVChart() {
  var ctxLastCV = document.getElementById("ctxLastCV");
  window.lastCVChartData =  {
    labels: ["PVOS", "NVOS", "PVSS", "NVSS", "PVFS", "NVFS"],
    datasets: [{
      label: 'kV',
      data: [20, 20, 20, 19, 14, 13.5],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  window.chartLastCV = new Chart(ctxLastCV, {
    type: 'bar',
    data: lastCVChartData,
    options: {
      responsive: true,
      legend: {
        position: 'bottom',
        display: false,
      },
      title: {
        display: true,
        text: 'Last voltages and currents readout'
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            fontSize: 14,
            labelString: 'Voltage [kV]'
          },
          ticks: {
            beginAtZero:true,
            suggestedMax: 30
          }
        }]
      },

      plugins: {
        datalabels: {
          color: 'black',
          display: true,
          font: {
            weight: 'bold'
          },
          formatter: function(value, context) {
            return Math.round(value * 100) / 100;
            // return context.dataIndex + ': ' + Math.round(value*100) + '%';
          }
        }
      },

    }
  });
}



function initCVChart() {
  var ctxCV = document.getElementById("ctxCV");

  window.chartColors = {
    orange: 'rgb(245, 176, 65)',
    green: 'rgb(46, 204, 113)',
    ligtblue: 'rgb(26, 188, 156)',
    blue: 'rgb(41, 128, 185)',
    purple: 'rgb(155, 89, 182)',
    red: 'rgb(231, 76, 60)',
  };
  window.cvChartData =  {
    labels: [],
    datasets: [
      {label: "PVOS", data: [], id: "v-axis", borderColor: window.chartColors.red},
      {label: "NVOS", data: [], id: "v-axis", borderColor: window.chartColors.green},
      {label: "PVSS", data: [], id: "v-axis", borderColor: window.chartColors.purple},
      {label: "NVSS", data: [], id: "v-axis", borderColor: window.chartColors.blue},
      {label: "PVFS", data: [], id: "v-axis", borderColor: window.chartColors.orange},
      {label: "NVFS", data: [], id: "v-axis", borderColor: window.chartColors.lightblue},
    ],
  };

  window.chartCV = new Chart(ctxCV, {
    type: 'line',
    data: cvChartData,
    options: {
      elements: { point: { radius: 0 } },
      responsive: true,
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      legend: {
        position: 'bottom',
        display: true,
      },
      title: {
        display: true,
        text: 'Voltages and currents trend'
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            displayFormats: {
              second: 'h:mm:ss'
            }
          }
        }],
        yAxes: [
          {
            id: "v-axis",
            position: "left",
            scaleLabel: {
              display: true,
              fontSize: 14,
              labelString: 'Voltage [kV]'
            },
            ticks: {
              beginAtZero:true,
              suggestedMax: 30
            }
          },
          {
            id: "c-axis",
            gridLines: { display:false },
            position: "right",
            scaleLabel: {
              display: true,
              fontSize: 14,
              labelString: 'Current [mA]'
            },
            ticks: {
              beginAtZero:true,
              suggestedMax: 2,
            }
          },

        ]
      },

      plugins: {
        datalabels: {
          display: false,
        }
      },
    }
  });

}
