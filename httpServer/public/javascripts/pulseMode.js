function changePulseMode(newMode, msg) {
  if (newMode === "Stop")  // stop always works
    setPulseMode("Stop");
  else{
    getInhibitFlag().then((status) =>{
      if (status.inhibit === 1) {
        alert("Cannot change to " + newMode + " as the inhibit flag is active. Is a trolley run going on?");
      }
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
          }}
        )
      }
    })
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
  if (newMode == "CCC") 
    $("#labelPulseMode").css({ 'color': $(".btn-success").css("background-color"),
      'font-size': '120%' });
  else if (newMode == "Stop") 
    $("#labelPulseMode").css({ 'color': $(".btn-danger").css("background-color"),
      'font-size': '120%' });
  else if (["1 Hz", "2 Hz", "5 Hz", "10 Hz", "Burst", "Single", "0.714 Hz"].includes(newMode))
    $("#labelPulseMode").css({ 'color': $(".btn-info").css("background-color"),
      'font-size': '120%' });
};

function singlePulse() {
  changePulseMode("1 Hz");
  setTimeout(function(){
    changePulseMode("Stop");
  }, 2500);
}

async function getInhibitFlag() {
  const ret = await $.ajax({
    type: 'GET',
    url: baseUrl + '/globalInhibit',
    success: function(data) {
      // console.log("Inhibit flag", data);
    },
    error: (xhr)=>{
      alert("Error", xhr);
    },
  })
  return ret;
}

function checkInhibitStatus() {
  setInterval(()=>{
    getInhibitFlag().then((status)=>{
      if (status.inhibit === 1) {
        // stop pulsing just in case it is not stopped yet
        getPulseMode().then((currentMode) => {
          if (currentMode!== "Stop") 
            changePulseMode("Stop");
        })

        // check the silent box, if it is not there yet
        if (document.getElementById("cbTrolleyRun").checked === false) 
          document.getElementById("cbTrolleyRun").click(true);

        $('#inhibitAlertDialog').modal("show");
      }
      else if (status.inhibit === 0) {
        if (document.getElementById("cbTrolleyRun").checked === true) 
          document.getElementById("cbTrolleyRun").click(false);

        $("#inhibitAlertDialog").modal("hide");
      }
    })
  }, 10 * 1000);
}
