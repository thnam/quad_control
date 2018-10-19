var socket = io.connect(baseUrl);
socket.on("spark", (data) => {
  window.spark = JSON.parse(data[0].message);
  displaySparkInfo();
});

async function getSparkInfo() {
  const ret = await $.ajax({
    type: 'GET',
    url: baseUrl + '/spark',
    success: function(data) { },
    error: (xhr)=>{
      alert("Error", xhr);
    },
  })
  return ret.message;
};

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
}
