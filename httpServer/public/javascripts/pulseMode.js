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
          success: (res) =>{
            console.log(res + ", pulse mode changed to " + newMode);

            // change state indicator
            $("#labelPulseMode").text(newMode);
            if (newMode == "External") 
              $("#labelPulseMode").css({ 'color': $(".btn-success").css("background-color"),
                'font-size': '120%' });
            else if (newMode == "Stop") 
              $("#labelPulseMode").css({ 'color': $(".btn-danger").css("background-color"),
                'font-size': '120%' });
            else if (["1 Hz", "5 Hz", "10 Hz", "Burst", "Single"].includes(newMode))
              $("#labelPulseMode").css({ 'color': $(".btn-info").css("background-color"),
                'font-size': '120%' });
          },
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

