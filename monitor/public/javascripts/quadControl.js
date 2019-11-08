$(() =>{
  // pulse mode buttons
  getPulseMode().then((currentMode)=>{
    displayPulseMode(currentMode);
  });

  readSparkThreshold();
  showLastSpark();

  $(':button').prop('disabled', true);
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

// const baseUrl = "http://" + document.location.hostname + ":" + document.location.port
const baseUrl = "http://gm2-01.dhcp.fnal.gov/quadMonitor/"
// var socket = io.connect(baseUrl, {resource: '/socket.io'});
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

