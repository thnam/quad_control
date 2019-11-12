function changePulseMode(newMode, msg) {
  if (newMode === "Stop")  // stop always works
    setPulseMode("Stop");
  else{
    // obtain the current pulsemode first
    getPulseMode().then((currentMode) => {
      if (currentMode === newMode) 
        alert("Already in " + newMode + "!");
      else {
        console.info("Start changing pulsemode from " + currentMode + " to " + newMode);

        if (currentMode !== "Stop")  // stop pulsing if necessary before changing
          setPulseMode("Stop").then(()=>{
            setPulseMode(newMode);
          });
        else 
          setPulseMode(newMode);
      }})
  }
}

// just set pulse mode, dont care about current mode
function setPulseMode(newMode) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'POST',
      url: baseUrl + '/pulsemode',
      data: {mode: newMode},
      success: (res) =>{
        console.info(res + ", pulse mode changed to " + newMode);
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
  $("#labelPulseMode0").text("Pulse mode: " + newMode);
  if (newMode == "External"){
    $("#labelPulseMode").css({ 'color': $(".btn-success").css("background-color"),
      'font-size': '120%' });
    $("#labelPulseMode0").css({ 'color': $(".btn-success").css("background-color"),
      'font-size': '120%' });
  }
  else if (newMode == "Stop"){
    $("#labelPulseMode").css({ 'color': $(".btn-danger").css("background-color"),
      'font-size': '120%' });
    $("#labelPulseMode0").css({ 'color': $(".btn-danger").css("background-color"),
      'font-size': '120%' });
  }
  else if (["1 Hz", "5 Hz", "10 Hz", "Burst", "Single"].includes(newMode)){
    $("#labelPulseMode").css({ 'color': $(".btn-info").css("background-color"),
      'font-size': '120%' });
    $("#labelPulseMode0").css({ 'color': $(".btn-info").css("background-color"),
      'font-size': '120%' });
  }
};
