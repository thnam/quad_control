function setupVoltageGroup() {
  // Toggling manual/preset mode
  if($('input[name=vMode]:checked').val() === "vPreset"){
    document.getElementById("manualPFS").disabled = true;
    document.getElementById("manualPSS").disabled = true;
    document.getElementById("manualPOS").disabled = true;
    document.getElementById("manualNFS").disabled = true;
    document.getElementById("manualNSS").disabled = true;
    document.getElementById("manualNOS").disabled = true;
    document.getElementById("vSetpoint").disabled = false;
  }
  else if($('input[name=vMode]:checked').val() === "vManual"){
    document.getElementById("manualPFS").disabled = false;
    document.getElementById("manualPSS").disabled = false;
    document.getElementById("manualPOS").disabled = false;
    document.getElementById("manualNFS").disabled = false;
    document.getElementById("manualNSS").disabled = false;
    document.getElementById("manualNOS").disabled = false;
    document.getElementById("vSetpoint").disabled = true;
  };

  $('input[type=radio][name=vMode]').change(function() {
    if (this.value === 'vPreset') {
      document.getElementById("manualPFS").disabled = true;
      document.getElementById("manualPSS").disabled = true;
      document.getElementById("manualPOS").disabled = true;
      document.getElementById("manualNFS").disabled = true;
      document.getElementById("manualNSS").disabled = true;
      document.getElementById("manualNOS").disabled = true;
      document.getElementById("vSetpoint").disabled = false;
    }
    else if (this.value === 'vManual') {
      document.getElementById("manualPFS").disabled = false;
      document.getElementById("manualPSS").disabled = false;
      document.getElementById("manualPOS").disabled = false;
      document.getElementById("manualNFS").disabled = false;
      document.getElementById("manualNSS").disabled = false;
      document.getElementById("manualNOS").disabled = false;
      document.getElementById("vSetpoint").disabled = true;
    }
  });
}

function reflectVPreset() { // manual entries follow setpoint
  let vSet = {};
  let str = $("#vSetpoint").val().split(",");
  vSet["pfs"] =  Number.parseFloat(str[0]);
  vSet["pss"] =  Number.parseFloat(str[1]);

  vSet["step"] = Number.parseFloat($("#vStep").val());
  vSet["interval"] = Number.parseFloat($("#vInterval").val());
  // console.log(vSet);

  $("#manualPFS").val(vSet["pfs"]);
  $("#manualNFS").val(vSet["pfs"]);
  $("#manualPSS").val(vSet["pss"]);
  $("#manualNSS").val(vSet["pss"]);
  $("#manualPOS").val(vSet["pss"]);
  $("#manualNOS").val(vSet["pss"]);
}

function reflectVManual() { // setpoint will follows manual entries
  let vSet = {};
  vSet["pfs"] = Number.parseFloat($("#manualPFS").val());
  vSet["pss"] = Number.parseFloat($("#manualPSS").val());
  vSet["pos"] = Number.parseFloat($("#manualPOS").val());
  vSet["nfs"] = Number.parseFloat($("#manualNFS").val());
  vSet["nss"] = Number.parseFloat($("#manualNSS").val());
  vSet["nos"] = Number.parseFloat($("#manualNOS").val());

  vSet["step"] = Number.parseFloat($("#vStep").val());
  vSet["interval"] = Number.parseFloat($("#vInterval").val());

  let str = Math.min(vSet["pfs"], vSet["nfs"]).toFixed(1) + ", ";
  str += Math.min(vSet["pos"], vSet["pss"], vSet.nos, vSet.nss).toFixed(1);

  $('#vSetpointList').append("<option value='" + str + "'>");
  document.getElementById('vSetpoint').value = str;
}

function toggleControlInRamping() {
  buttons = ["p1kV", "m1kV", "m2kV", "m3kV", "m4kV", "m10kV",
    "setVoltages", "zeroVoltages"];

  if (window.ramping) 
    buttons.forEach(btn =>{ document.getElementById(btn).disabled = true; })
  else
    buttons.forEach(btn =>{ document.getElementById(btn).disabled = false; })
}
