var socket = io.connect(baseUrl);
socket.on("cv", (data) => {
  const values = data.cv;

  // update the voltages and currents first
  const lastCV = JSON.parse(values[0].message);

  document.getElementById("pbPVOS").value = parseFloat(lastCV.os.pv);
  document.getElementById("pbNVOS").value = Math.abs(parseFloat(lastCV.os.nv));
  document.getElementById("pbPVSS").value = parseFloat(lastCV.fs.pv);
  document.getElementById("pbNVSS").value = Math.abs(parseFloat(lastCV.fs.nv));
  document.getElementById("pbPVFS").value = parseFloat(lastCV.ss.pv);
  document.getElementById("pbNVFS").value = Math.abs(parseFloat(lastCV.ss.nv));
  $("#valPVOS").html(lastCV.os.pv)
  $("#valNVOS").html(lastCV.os.nv)
  $("#valPVSS").html(lastCV.ss.pv)
  $("#valNVSS").html(lastCV.ss.nv)
  $("#valPVFS").html(lastCV.fs.pv)
  $("#valNVFS").html(lastCV.fs.nv)
  // then cv table
})
