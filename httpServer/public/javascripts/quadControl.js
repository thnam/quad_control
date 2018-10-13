$(() =>{
  // pulse mode buttons
  $("#btnExternal").click(()=>{ changePulseMode("External");});
  $("#btnStop").click(()=>{ changePulseMode("Stop");});
  $("#btnInternal").click(()=>{
    changePulseMode($("#internalMode").val()) });

  getPulseMode().then((currentMode)=>{
    displayPulseMode(currentMode);
  });
  // 
  $("#setVoltages").click(()=>{ setVoltages() })
  $("#zeroVoltages").click(()=>{ zeroVoltages() })
  $("#p1kV").click(()=>{ changeVoltages(1);})
  $("#m1kV").click(()=>{ changeVoltages(-1);})
  $("#m2kV").click(()=>{ changeVoltages(-2);})
  $("#m3kV").click(()=>{ changeVoltages(-3);})
  $("#m4kV").click(()=>{ changeVoltages(-4);})
  $("#m10kV").click(()=>{ changeVoltages(-10);})

})

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

const baseUrl = "http://" + document.location.hostname + ":" + document.location.port
var socket = io.connect(baseUrl);
socket.on('greeting', function(data) {
  console.log(data.message);
  // socket.emit('join', 'Hello World from client');
});

socket.on("timeStamp", (data) =>{
  $("#clock").html('<h4> Server time: ' + data.timeStamp + '</h4>');
});

window.onload = () => {
  initCVCharts();
  initPSCharts();
  setupVoltageGroup();
};

