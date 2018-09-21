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
      {
        $.ajax({
          type: 'POST',
          url: baseUrl + '/pulsemode',
          data: {currentMode: currentMode, newMode: newMode}
        });
      }
    },
    error: function() {
      alert("Error");

    }
  });
}
