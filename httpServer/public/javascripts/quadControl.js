$(() =>{
  trolleyRunToggle();
  // pulse mode buttons
  $("#btnCCC").click(()=>{ changePulseMode("CCC");});
  $("#btnStop").click(()=>{ changePulseMode("Stop");});
  $("#btnInternal1Hz").click(()=>{ changePulseMode("1 Hz");});
  $("#btnInternal2Hz").click(()=>{ changePulseMode("2 Hz");});
  $("#btnInternal5Hz").click(()=>{ changePulseMode("5 Hz");});
  $("#btnInternal10Hz").click(()=>{ changePulseMode("10 Hz");});
  $("#btnInternalBurst").click(()=>{ changePulseMode("Burst");});
  $("#btnInternal0_7Hz").click(()=>{ changePulseMode("0.714 Hz");});
  $("#btnInternalSingle").click(()=>{singlePulse()});

  $("#btnSetP1Timing").click(()=>{ configPulser(1);});
  $("#btnSetP2Timing").click(()=>{ configPulser(2);});
  $("#btnSetP3Timing").click(()=>{ configPulser(3);});
  $("#btnSetP4Timing").click(()=>{ configPulser(4);});
  $("#btnLoadNominalTiming").click(()=>{loadPresetTiming("nominal");});
  $("#btnLoadPOS100ms").click(()=>{loadPresetTiming("POS100ms");});

  getPulseMode().then((currentMode)=>{
    displayPulseMode(currentMode);
  });

  readSparkThreshold();
  showLastSpark();

  $("#btnReadThreshold").click(()=>{readSparkThreshold()});
  $("#btnSetThreshold").click(()=>{setSparkThreshold()});

  $("#btnSparkAlarmReset").click(() => {
    window.sparkAlarmAudio.pause();
    window.sparkAlarmAudio.currentTime = 0.0;
    window.faultAlarmAudio.pause();
    window.faultAlarmAudio.currentTime = 0.0;
    clearSparkDisplay();
  });

  // $("#btnClearSparkDiplay").click(() => {clearSparkDisplay();});

  $("#btnFaultAlarmReset").click(() => {
    window.faultAlarmAudio.pause();
    window.faultAlarmAudio.currentTime = 0.0;
    window.sparkAlarmAudio.pause();
    window.sparkAlarmAudio.currentTime = 0.0;
  });
  // 
  $("#setVoltages").click(()=>{ ramp() });
  $("#zeroVoltages").click(()=>{ zeroVoltage() });
  $("#abortRamping").click(()=>{ abortRamping() });
  $("#p1kV").click(()=>{ increaseVoltages(1);});
  $("#m1kV").click(()=>{ increaseVoltages(-1);});
  $("#m2kV").click(()=>{ increaseVoltages(-2);});
  $("#m3kV").click(()=>{ increaseVoltages(-3);});
  $("#m4kV").click(()=>{ increaseVoltages(-4);});
  $("#m10kV").click(()=>{ increaseVoltages(-10);});

  $("#btnRefreshSparkHistory").click(() => {showSparkHistory();});
  $("#btnRefreshFaultHistory").click(() => {showFaultHistory();});
  $("#btnResetPOSFault").click(() => {singlePulse(); resetFault("POS")});
  $("#btnResetNOSFault").click(() => {singlePulse(); resetFault("NOS")});
  $("#btnResetPTSFault").click(() => {singlePulse(); resetFault("PTS")});
  $("#btnResetNTSFault").click(() => {singlePulse(); resetFault("NTS")});
  $("#btnFaultReset").click(() => {
    singlePulse();
    resetFault("NTS");
    resetFault("PTS");
    resetFault("NOS");
    resetFault("POS");
  });

})

plotColor = [
  '#ff7f0e',  // safety orange
  '#1f77b4',  // muted blue
  '#d62728',  // brick red
  '#2ca02c',  // cooked asparagus green
  '#e377c2',  // raspberry yogurt pink
  '#17becf',   // blue-teal
  '#8c564b',  // chestnut brown
  '#9467bd',  // muted purple
  '#7f7f7f',  // middle gray
  '#bcbd22',  // curry yellow-green
];

window.sparkAlarmAudio = document.getElementById("sparkAlarmAudio");
window.faultAlarmAudio = document.getElementById("faultAlarmAudio");

window.ramping = false;
window.handlingSparkEvent = false;

window.initialSparkThresholdsRead = false;

const baseUrl = "http://" + document.location.hostname + ":" + document.location.port
var socket = io.connect(baseUrl);
socket.on('greeting', function(data) {
  window.controller = data.controller;
  window.role = data.role;
  console.info(data.message);
  console.info('Controller in use is', window.controller);
  console.info("Role of this GUI is:", data.role);

  // disable all inputs unless it is the main GUI
  if (data.role !== "main") {
    document.title = "ESQ Monitor (read-only)";
    $(':input').prop('disabled', true);
    $('#topheader').text('ESQ Monitor (read-only)'); 

    // refresh things every 10 sec
    setInterval(async ()=>{
      showSparkHistory();
      showFaultHistory();
      let pulseMode = await getPulseMode();
      displayPulseMode(pulseMode);
      showLastSpark();

    }, 15*1000);
  }

  document.getElementById("btnSetP1Timing").disabled = true;
  document.getElementById("btnSetP2Timing").disabled = true;
  document.getElementById("btnSetP3Timing").disabled = true;
  document.getElementById("btnSetP4Timing").disabled = true;
  document.getElementById("btnLoadNominalTiming").disabled = true;
  document.getElementById("btnLoadPOS100ms").disabled = true;
  document.getElementById("cbEnablePulser1").disabled = true;
  document.getElementById("cbEnablePulser2").disabled = true;
  document.getElementById("cbEnablePulser3").disabled = true;
  document.getElementById("cbEnablePulser4").disabled = true;

});

socket.on("reload", ()=>{
  console.log("Forced reload message received");
  window.location.reload(true);
})

function forceReload() {
  socket.emit("reloadReq");
}

socket.on("timeStamp", (data) =>{
  $("#clock").html('<h4> Server time: ' + data.timeStamp + '</h4>');
});

window.onload = () => {
  initCVCharts();
  initPSCharts();
  setupVoltageGroup();

  (async ()=>{
    let vRead = await getVoltage();

    let vFS = parseFloat(((vRead.fs.pv + Math.abs(vRead.fs.nv)) / 2).toFixed(1));
    let vSS = parseFloat(((vRead.ss.pv + Math.abs(vRead.ss.nv)) / 2).toFixed(1));
    let vOS = parseFloat(((vRead.os.pv + Math.abs(vRead.os.nv)) / 2).toFixed(1));

    let str = vFS.toString() + ", " + vSS.toString();
    $('#vSetpointList').append("<option value='" + str + "'>");
    document.getElementById('vSetpoint').value = str;
    reflectVPreset();
  })();

  refreshTimingInfo();
  showSparkHistory();
  showFaultHistory();
  checkInhibitStatus();
  readEnabledPulsers();
};

socket.on("pulseMode", (data) => {
  displayPulseMode(data.message);
});

