$(() =>{
  $("#btnExternal").click(()=>{ setPulseMode("External");});
  $("#btnStop").click(()=>{ setPulseMode("Stop");});
  $("#btnInternal").click(()=>{
    setPulseMode($("#internalMode").val())
  });

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
};
