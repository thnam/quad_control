socket.on("sparkPattern", (data) => {
  window.spark = data[0].meta;
  displaySparkInfo();
});

socket.on("sparked", (data) =>{
  if (!window.trolleyRun) { // not handling when trolley run is going
    if (window.handlingSparkEvent === false) {
      console.log("Sparked message received!");
      if (window.ramping) {
        window.ramping = false;
        handleSparkEvent("Spark! Ramping is aborted.");
      } else {
        handleSparkEvent("Spark!");
      }

      // not handle this again for next 60 sec
      window.handlingSparkEvent = true;
      setTimeout(function(){ window.handlingSparkEvent = false; }, 60*1000);
    }
  }
});

function displaySparkInfo() {
  let sparkTable = document.getElementById("sparkTable");
  let plate = ["t", "b", "i", "o"];

  for (var iRow = 0; iRow < sparkTable.rows.length; iRow++) {
    let qName = "q" + (iRow + 1).toString();
    let row = sparkTable.rows[iRow];

    let cellId = 1;
    for (var iP = 0; iP < plate.length; iP++) {
      let sparkNum = parseInt(window.spark[qName].s[plate[iP]]);
      row.cells[cellId + iP].innerHTML = plate[iP].toUpperCase() + ": " + sparkNum.toString();
      if (sparkNum > 0) {
        row.cells[cellId + iP].classList.remove("table-success");
        row.cells[cellId + iP].classList.add("table-warning");
      }
      else{
        row.cells[cellId + iP].classList.remove("table-warning");
        row.cells[cellId + iP].classList.add("table-success");
      }
    }

    cellId = 6;
    for (var iP = 0, len = plate.length; iP < len; iP++) {
      let sparkNum = parseInt(window.spark[qName].l[plate[iP]]);
      row.cells[cellId + iP].innerHTML = plate[iP].toUpperCase() + ": " + sparkNum.toString();
      if (sparkNum > 0) {
        row.cells[cellId + iP].classList.remove("table-success");
        row.cells[cellId + iP].classList.add("table-warning");
      }
      else{
        row.cells[cellId + iP].classList.remove("table-warning");
        row.cells[cellId + iP].classList.add("table-success");
      }
    }
  }
};

function readSparkThreshold() {
  $.get(baseUrl + "/sparkThreshold").done((data) =>{
    try {
      let thr = data[0].meta;
      if (thr.source == "BU") {
        entry = "#upperThresholdReadback";
        $(entry).text(thr.high.toString());
        $(entry).css({"color": $(".btn-success").css("background-color")});
        entry = "#lowerThresholdReadback";
        $(entry).text(thr.low.toString());
        $(entry).css({"color": $(".btn-success").css("background-color")});

        if (!(window.initialSparkThresholdsRead)){
          document.getElementById("upperThreshold").value = thr.high;
          document.getElementById("lowerThreshold").value = thr.low;
          window.initialSparkThresholdsRead = true;
        }
      }

      else if (thr.source == "Sten") {
        entry = "#slot3Readback";
        $(entry).text(thr["3"].toString());
        $(entry).css({"color": $(".btn-success").css("background-color")});
        entry = "#slot6Readback";
        $(entry).text(thr["6"].toString());
        $(entry).css({"color": $(".btn-success").css("background-color")});

        if (!(window.initialSparkThresholdsRead)){
          document.getElementById("slot3").value = thr["3"];
          document.getElementById("slot6").value = thr["6"];
          window.initialSparkThresholdsRead = true;
        }
      }

    } catch (e) {
      console.error(e);
      entry = "#upperThresholdReadback";
      $(entry).text(`ERROR!`);
      $(entry).css({"color": $(".btn-danger").css("background-color")});
      entry = "#lowerThresholdReadback";
      $(entry).text(`ERROR!`);
      $(entry).css({"color": $(".btn-danger").css("background-color")});

      entry = "#slot3Readback";
      $(entry).text(`ERROR!`);
      $(entry).css({"color": $(".btn-danger").css("background-color")});
      entry = "#slot6Readback";
      $(entry).text(`ERROR!`);
      $(entry).css({"color": $(".btn-danger").css("background-color")});
    }
  })
};

function setSparkThreshold() {
  if (window.controller === "BU") {
    thresholds = {"high": Number(document.getElementById("upperThreshold").value)
      , "low": Number(document.getElementById("lowerThreshold").value)};
  }
  else if (window.controller === "Sten"){
    thresholds = {"slot3": Number(document.getElementById("slot3").value)
      , "slot6": Number(document.getElementById("slot6").value)};
  }

  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'POST',
      url: baseUrl + '/sparkThreshold',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(thresholds),
      traditional: true,
      success: (res) =>{
        resolve(true);
        console.log("Thresholds set succesfully");
        readSparkThreshold();
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Could not set thresholds, " + err.responseText);
      } });
  });
};

function handleSparkEvent(msg) {
  changePulseMode("Stop");
  playAlarmSound(window.sparkAlarmAudio);
  showSparkHistory();
  showLastSpark();
  showAlert("spark");
  // alert(msg);
}

const quadNums = ["q1", "q2", "q3", "q4"];
const quadLengths = ["l", "s"];
const quadPlates = ["t", "b", "i", "o"];

function showSparkHistory(sparkSign="&#9889") {
  $.get(baseUrl + "/sparkHistory")
    .done((data)=>{
      var sparkData = [];
      let sparkTable = $("#sparkHistoryTableBody");
      sparkTable.empty();

      for (var i = 0; i < data.length; i++) {
        timestamp = new Date(data[i].timestamp);
        timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
        pattern = data[i].meta;

        patternStr = "";
        sparkedQuads = [];

        let content = "<tr>";
        content += "<td>" + timestamp + "</td>";

        for (const qn of quadNums) 
          for (const ql of quadLengths) 
            for (const qp of quadPlates){
              if (pattern[qn][ql][qp] > 0) 
                content += "<td>" + sparkSign + "</td>";
              else
                content += "<td></td>";
            } 

        content += "</tr>";
        sparkTable.append(content);
      }
    })
    .fail(()=>{
      alert("Cannot get spark history ...");
    })
  
}

function showLastSpark() {
  $.get(baseUrl + "/lastSpark")
    .done((data)=>{
      timestamp = new Date(data.timestamp);
      timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
      pattern = data.meta;
      patternStr = "";

      for (const qn of quadNums) 
        for (const ql of quadLengths) 
          for (const qp of quadPlates) 
            if (pattern[qn][ql][qp] > 0) 
              patternStr += (qn + ql + qp).toUpperCase() + ", ";

      if (patternStr.length > 2)
        patternStr = patternStr.slice(0, -2);

      $("#lastSpark").text("Last: " + timestamp);
      $("#sparkedQuads").text("on: " + patternStr);

      showSparkHistory();
    })
    .fail(()=>{
      $("#lastSpark").text("Last: None");
    })
}

function playAlarmSound(audio, period=20) {
  audio.loop = true;
  setTimeout(()=>{audio.loop = false}, period * 1000);
  audio.play();
}

function clearSparkDisplay() {
  if (window.controller === "BU") {
    console.log("Re-arm spark detection");
    setSparkThreshold();
  }
  else if (window.controller == "Sten") {
    console.log("Clear CAMAC scaler");
    return new Promise(function (resolve, reject) {
      $.ajax({
        type: 'POST',
        url: baseUrl + '/clearSparkDisplay',
        success: (res) =>{
          resolve(true);
          console.log("Spark display cleared");
        },
        error: (err, stat) =>{
          resolve(false);
          alert("Could not clear spark display" + err.responseText);
        } });
    });

  }
};

function sumSpark(obj){
  var sum = 0;
  for( var el in obj ){
    if( obj.hasOwnProperty(el)){
      sum += obj[el]; 
    }
  }
  return sum;
}

function trolleyRunToggle() {
    window.trolleyRun = document.getElementById("cbTrolleyRun").checked;
    var element = document.getElementById("silentAlarmWarning");
    if (window.trolleyRun === true) {
        element.classList.remove("invisible");
        element.classList.add("visible");
    }
    else{
        element.classList.remove("visible");
        element.classList.add("invisible");
    }
}

function showAlert(alertType) {
  if (alertType === "spark") 
    $('#sparkAlertDialog').modal();
  else if (alertType === "fault") 
    $('#faultAlertDialog').modal();
}
