var socket = io.connect(baseUrl);
socket.on("spark", (data) => {
  window.spark = JSON.parse(data[0].message);
  displaySparkInfo();
});

function displaySparkInfo() {
  let sparkTable = document.getElementById("sparkTable");
  let plate = ["t", "b", "i", "o"];

  for (var iRow = 0, len = sparkTable.rows.length; iRow < len; iRow++) {
    let qName = "q" + (iRow + 1).toString();
    let row = sparkTable.rows[iRow];

    let cellId = 1;
    for (var iP = 0, len = plate.length; iP < len; iP++) {
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
  $.get(baseUrl + "/camacThreshold").done((data) =>{
    if (!data.error) {
      try {
        let thr = JSON.parse(data[0].message);

        Object.keys(thr).forEach(slot =>{
          entry = "#slot" + slot.toString() + "Th";
          $(entry).text(thr[slot] + " mV");

          if (thr[slot] >= 800) 
            $(entry).css({"color": $(".btn-success").css("background-color")});
          else
            $(entry).css({"color": $(".btn-danger").css("background-color")});
        });
      } catch (e) {
        console.error(e);
        $("#slot3Th").text(`ERROR!`);
        $("#slot3Th").css({"color": $(".btn-danger").css("background-color")});
        $("#slot6Th").text(`ERROR!`);
        $("#slot6Th").css({"color": $(".btn-danger").css("background-color")});
      }
    } else {
      $("#slot3Th").text(`ERROR!`);
      $("#slot3Th").css({"color": $(".btn-danger").css("background-color")});
      $("#slot6Th").text(`ERROR!`);
      $("#slot6Th").css({"color": $(".btn-danger").css("background-color")});
    }
  })
};

function handleSparkEvent(msg) {
  changePulseMode("Stop");
  // reset the spark bit here
  //
  alert(msg);
}
