function changePulseMode(newMode) {
  // always get current pulsemode first
  getPulseMode().then((currentMode) => {
    if (currentMode === newMode) 
      alert("Already in " + newMode + "!");
    else {
      console.log("Start changing pulsemode from " + currentMode + " to " + newMode);

      if (currentMode !== "Stop")  // stop pulsing if necessary
        setPulseMode("Stop").then(()=>{
          setPulseMode(newMode);
        });
      else 
        setPulseMode(newMode);
    }
  })
}

// just set pulse mode, dont care about current mode
function setPulseMode(newMode) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'POST',
      url: baseUrl + '/pulsemode',
      data: {mode: newMode},
      success: (res) =>{
        console.log(res + ", pulse mode changed to " + newMode);
        displayPulseMode(newMode);
        resolve(true);
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Couldn't change pulse mode, error message: " + err.responseText);
      } });
  });
};

async function getPulseMode() {
  const ret = await $.ajax({
    type: 'GET',
    url: baseUrl + '/pulsemode',
    success: function(data) { },
    error: (xhr)=>{
      alert("Error", xhr);
    },
  })
  return ret.message;
};

function displayPulseMode(newMode) {
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
};
