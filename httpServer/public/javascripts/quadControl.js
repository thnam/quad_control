$(() =>{
  $("#btnExternal").click(()=>{ setPulseMode("External");})
  $("#btnStop").click(()=>{ setPulseMode("Stop");})

})

var baseUrl = "http://" + document.location.hostname + ":" + document.location.port

function setPulseMode(newMode) {
  $.ajax({
    type: 'GET',
    url: baseUrl + '/pulsemode',
    success: function(resp) {
      console.log(resp);
      currentMode = resp.message;
      if (newMode == currentMode) {
        alert("Already in " + newMode + "!");
      }
      else
        alert("Changing from " + currentMode + " to " + newMode);
    },
    error: function() {
      alert("Error");

    }
  });
}
