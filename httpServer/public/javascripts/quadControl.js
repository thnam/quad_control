$(() =>{
  // pulse mode buttons
  $("#btnExternal").click(()=>{ changePulseMode("External");});
  $("#btnStop").click(()=>{ changePulseMode("Stop");});
  $("#btnInternal1Hz").click(()=>{ changePulseMode("1 Hz");});
  $("#btnInternal2Hz").click(()=>{ changePulseMode("2 Hz");});
  $("#btnInternal5Hz").click(()=>{ changePulseMode("5 Hz");});
  $("#btnInternal10Hz").click(()=>{ changePulseMode("10 Hz");});
  $("#btnInternalBurst").click(()=>{ changePulseMode("Burst");});
  $("#btnInternalSingle").click(()=>{ changePulseMode("Single");});

  $("#btnSetP1Timing").click(()=>{ configPulser(1);});
  $("#btnSetP2Timing").click(()=>{ configPulser(2);});
  $("#btnSetP3Timing").click(()=>{ configPulser(3);});
  $("#btnSetP4Timing").click(()=>{ configPulser(4);});

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
    clearSparkDisplay();
  });

  $("#btnClearSparkDiplay").click(() => {clearSparkDisplay();});

  $("#btnFaultAlarmReset").click(() => {
    window.faultAlarmAudio.pause();
    window.faultAlarmAudio.currentTime = 0.0;
  });
  // 
  $("#setVoltages").click(()=>{ changeVoltage() });
  $("#zeroVoltages").click(()=>{ zeroVoltage() });
  $("#abortRamping").click(()=>{ abortRamping() });
  $("#p1kV").click(()=>{ increaseVoltages(1);});
  $("#m1kV").click(()=>{ increaseVoltages(-1);});
  $("#m2kV").click(()=>{ increaseVoltages(-2);});
  $("#m3kV").click(()=>{ increaseVoltages(-3);});
  $("#m4kV").click(()=>{ increaseVoltages(-4);});
  $("#m10kV").click(()=>{ increaseVoltages(-10);});

  $("#btnRefreshSparkHistory").click(() => {showSparkHistory();});
  $("#btnResetPOSFault").click(() => {resetFault("POS")});
  $("#btnResetNOSFault").click(() => {resetFault("NOS")});
  $("#btnResetPTSFault").click(() => {resetFault("PTS")});
  $("#btnResetNTSFault").click(() => {resetFault("NTS")});
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

const baseUrl = "http://" + document.location.hostname + ":" + document.location.port
var socket = io.connect(baseUrl);
socket.on('greeting', function(data) {
  console.info(data.message);
  // socket.emit('join', 'Hello World from client');
});

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

  showTimingInfo();
  showSparkHistory();
};

