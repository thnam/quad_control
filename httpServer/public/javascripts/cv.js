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
})

window.onload = () => {
  var ctxLastCV = document.getElementById("ctxLastCV");
  window.lastCVChartData =  {
    labels: ["PVOS", "NVOS", "PVSS", "NVSS", "PVFS", "NVFS"],
    datasets: [{
      label: 'kV, absolute value in case of negative voltage',
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
      },
      title: {
        display: true,
        text: 'Last voltages and currents readout'
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true,
            suggestedMax: 30
          }
        }]
      }
    }
  });
}
