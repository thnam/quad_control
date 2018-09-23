$(() =>{
  $("#btnExternal").click(()=>{ setPulseMode("External");});
  $("#btnStop").click(()=>{ setPulseMode("Stop");});
  $("#btnInternal").click(()=>{
    setPulseMode($("#internalMode").val())
  });

})

const baseUrl = "http://" + document.location.hostname + ":" + document.location.port

function setPulseMode(newMode) {
  // get the current pulse mode first
  $.ajax({
    type: 'GET',
    url: baseUrl + '/pulsemode',
    success: function(resp) {
      console.log(resp);
      currentMode = resp.message;
      if (newMode == currentMode) { // do nothing if nothing changes
        alert("Already in " + newMode + "!");
      }
      else { // post request otherwise
        $.ajax({
          type: 'POST',
          url: baseUrl + '/pulsemode',
          data: {currentMode: currentMode, newMode: newMode},
          success: (res) =>{console.log(res + ", pulse mode changed.")},
          error: (err, stat) =>{
            alert("Couldn't change pulse mode, error message: " + err.responseText);
          }
        });
      }
    },
    error: function() {
      alert("Error");
    }
  });
}

let lastCVEvent = new EventSource('/cv');
lastCVEvent.onmessage = (ev) => {
  data = JSON.parse(ev.data);

  if (data.error)  // stop processing on error data
    return;

  console.log(data);
};

var socket = io.connect(baseUrl);
socket.on('news', function(data) {
  console.log(data);
  socket.emit('join', 'Hello World from client');
});

socket.on("timeStamp", (data) =>{
  $("#clock").html('<h4> Server time: ' + data.timeStamp + '</h4>');
});
