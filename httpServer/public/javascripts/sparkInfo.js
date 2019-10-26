var socket = io.connect(baseUrl);
socket.on("sparkPattern", (data) => {
  window.spark = data[0].meta;
  displaySparkInfo();
});

socket.on("sparked", (data) =>{
  if (window.handlingSparkEvent == false) {
    console.log("Sparked message received!");
    if (window.ramping) {
      window.ramping = false;
      handleSparkEvent("Spark! Ramping is aborted.");
    } else {
      handleSparkEvent("Spark!");
    }

    // not handle this again for next 60 sec
    window.handlingSparkEvent = true;
    setTimeout(function(){
      window.handlingSparkEvent = false;
    }, 60*1000);
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
      entry = "#upperThresholdReadback";
      $(entry).text(thr.high.toString());
      $(entry).css({"color": $(".btn-success").css("background-color")});
      entry = "#lowerThresholdReadback";
      $(entry).text(thr.low.toString());
      $(entry).css({"color": $(".btn-success").css("background-color")});

    } catch (e) {
      console.error(e);
      entry = "#upperThresholdReadback";
      $(entry).text(`ERROR!`);
      $(entry).css({"color": $(".btn-danger").css("background-color")});
      entry = "#lowerThresholdReadback";
      $(entry).text(`ERROR!`);
      $(entry).css({"color": $(".btn-danger").css("background-color")});
    }
  })
};

function handleSparkEvent(msg) {
  changePulseMode("Stop");
  playAlarmSound(window.sparkAlarmAudio);
  alert(msg);
}

function showLastSpark() {
  $.get(baseUrl + "/lastSpark")
    .done((data)=>{
      timestamp = new Date(data.timestamp);
      timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

      sparkedQuads = [];
      quadType = ["l", "s"];

      pattern = data.meta;

      for (var i = 0, len = 4; i < len; i++) {
        quadStr = "q" + (i + 1).toString();

        for (var j = 0; j < 2; j++) {
          nSparks = sumSpark(pattern[quadStr][quadType[j]]);
          if (nSparks > 0) {
            sparkedQuads.push((quadStr + quadType[j]).toUpperCase());
          }
        }
      }

      $("#lastSpark").text("Last: " + timestamp);
      $("#sparkedQuads").text("on: " + sparkedQuads);
    })
    .fail(()=>{
      $("#lastSpark").text("Last: None");
    })
}

function sumSpark(obj){
  var sum = 0;
  for( var el in obj ){
    if( obj.hasOwnProperty(el)){
      sum += obj[el]; 
    }
  }
  return sum;
}

function playAlarmSound(audio, period=20) {
  audio.loop = true;
  setTimeout(()=>{audio.loop = false}, period * 1000);
  audio.play();
}

function clearSparkDisplay() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'POST',
      url: baseUrl + '/clearSparkDisplay',
      success: (res) =>{
        resolve(true);
        displaySparkInfo();
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Failed to clear spark display: " + err.responseText);
      } });
  });
};

function showSparkHistory() {
  $.get(baseUrl + "/sparkHistory")
    .done((data)=>{
      var sparkData = [];
      for (var i = 0; i < 10; i++) {
        timestamp = new Date(data[i].timestamp);
        timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

        patternStr = "";
        sparkedQuads = [];
        quadType = ["l", "s"];

        pattern = data[i].meta;

        for (var k = 0; k < 4; k++) {
          quadStr = "q" + (k + 1).toString();

          for (var j = 0; j < 2; j++) {
            nSparks = sumSpark(pattern[quadStr][quadType[j]]);
            if (nSparks > 0) {
              patternStr += (quadStr + quadType[j]).toUpperCase() + ": ";
              patternStr += JSON.stringify(pattern[quadStr][quadType[j]]) + "\n";
            }
          }
        }

        sparkBit = data[i].meta.sparkBit;

        sparkData.push({"timestamp": timestamp,
          "sparkPattern": patternStr, "sparkBit": sparkBit});
      }
      var $histSparkTable = $('#sparkHistoryTable');
      $histSparkTable.bootstrapTable({data: sparkData});

    })
    .fail(()=>{
      alert("Cannot get spark history ...");
    })
  
}
