$(() =>{
  $("#btn1Hz").click(()=>{ setPulseMode("1 Hz");})
  $("#btn2Hz").click(()=>{ setPulseMode("2 Hz");})
  $("#btn5Hz").click(()=>{ setPulseMode("5 Hz");})
  $("#btn12Hz").click(()=>{ setPulseMode("12 Hz");})
  $("#btnBurst").click(()=>{ setPulseMode("Burst");})
  $("#btnExternal").click(()=>{ setPulseMode("External");})
  $("#btnStop").click(()=>{ setPulseMode("Stop");})
})

var baseUrl = "http://" + document.location.hostname + ":" + document.location.port

function setPulseMode(newMode) {
  $.get(baseUrl + "/pulsemode").done((currentMode)=> {
    alert(currentMode);
  });
}
