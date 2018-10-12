function changePulseMode(newMode) {
  // always get current pulsemode first
  getPulseMode().then((currentMode) => {
    console.log("Current mode: " + currentMode);
    if (currentMode !== "Stop")  // stop pulsing if necessary
    {
      setPulseMode("Stop").then(()=>{ 
        console.log("changing to ", newMode);
        setPulseMode(newMode) });
    }
    else
      setPulseMode(newMode);
  })
}

async function setPulseMode(newMode) {
  getPulseMode().then((currentMode) => {
    if (newMode === currentMode) 
      alert("Already in " + newMode + "!");
    else
      $.ajax({
        type: 'POST',
        url: baseUrl + '/pulsemode',
        data: {currentMode: currentMode, newMode: newMode},
        success: (res) =>{
          console.log(res + ", pulse mode changed to " + newMode);
          displayPulseMode(newMode);
        },
        error: (err, stat) =>{
          alert("Couldn't change pulse mode, error message: " + err.responseText);
        } });
  })
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
