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
  $("#setVoltages").click(()=>{ changeVoltage() });
  $("#zeroVoltages").click(()=>{ zeroVoltage() });
  $("#abortRamping").click(()=>{ abortRamping() });
  $("#p1kV").click(()=>{ increaseVoltages(1);});
  $("#m1kV").click(()=>{ increaseVoltages(-1);});
  $("#m2kV").click(()=>{ increaseVoltages(-2);});
  $("#m3kV").click(()=>{ increaseVoltages(-3);});
  $("#m4kV").click(()=>{ increaseVoltages(-4);});
  $("#m10kV").click(()=>{ increaseVoltages(-10);});

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

window.ramping = false;

const baseUrl = "http://" + document.location.hostname + ":" + document.location.port
var socket = io.connect(baseUrl);
socket.on('greeting', function(data) {
  console.info(data.message);
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

