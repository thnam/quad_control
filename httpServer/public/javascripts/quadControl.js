$(() =>{
  $("#btnExternal").click(()=>{ setPulseMode("External");});
  $("#btnStop").click(()=>{ setPulseMode("Stop");});
  $("#btnInternal").click(()=>{
    setPulseMode($("#internalMode").val())
  });

})

var socket = io.connect(baseUrl);
socket.on('greeting', function(data) {
  console.log(data.message);
  // socket.emit('join', 'Hello World from client');
});

socket.on("timeStamp", (data) =>{
  $("#clock").html('<h4> Server time: ' + data.timeStamp + '</h4>');
});

window.onload = () => {
  initCharts();
};
