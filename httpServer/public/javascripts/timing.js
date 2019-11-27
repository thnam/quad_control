
let timingTab = document.getElementById("timingInfoTable");

var pulser, attr, rfAttr, state;
if (window.controller === "BU") {
  pulser = ["1", "2", "3", "4"];
  attr = ["enable_2step", "charge_start", "step1_end",
    "step2_start", "charge_end", "discharge_start", "discharge_end"];
  rfAttr = ["width", "delay1", "delay2", "delay3", "delay4"];
  state = ["active", "proposed"];
}
else {
  attr = ["os", "fs", "fs2ss", "ss", "ss2dis", "dis"];
}

function showTimingInfo() {
  $.get(baseUrl + "/timing")
    .done((data)=>{
      if (window.controller === "BU") {
        let pulserInfo = data.pulser;
        for (var i = 0, len = pulser.length; i < len; i++) {
          for (var k = 0, lenk = attr.length; k < lenk; k++) {
            let row = timingTab.rows[k + 2];
            for (var j = 0, lenj = state.length; j < lenj; j++) {
              let colN = [1 + 2 * i + j];
              let content = pulserInfo[pulser[i]][state[j]][attr[k]];
              if (j === 0) { //active
                if (!([2, 3].includes(k))) {
                  row.cells[colN].innerHTML = content;
                }
                else{
                  let is2Step = (pulserInfo[pulser[i]][state[j]][attr[0]]);
                  if (is2Step) 
                    row.cells[colN].innerHTML = content;
                  else 
                    row.cells[colN].innerHTML = "N/A";
                }
              } else {
                row.cells[colN].firstChild.defaultValue = (content);
              }
            }
          }
        }

        let rfInfo = data.rf;
        for (var i = 0, len = pulser.length; i < len; i++) {
          for (var k = 0, lenk = rfAttr.length; k < lenk; k++) {
            let row = timingTab.rows[k + 9];
            for (var j = 0, lenj = state.length; j < lenj; j++) {
              let colN = [1 + 2 * i + j];
              let content = rfInfo[pulser[i]][rfAttr[k]];
              if (j === 0)
                row.cells[colN].innerHTML = content;
              else
                row.cells[colN].firstChild.defaultValue = content;
            }
          }
        }
      }
      else if (window.controller === "Sten") {
        for (var iAttr = 0, lenAttr = attr.length; iAttr < lenAttr; iAttr++) {
          let row = timingTab.rows[iAttr + 2];
          let content = data[attr[iAttr]];
          row.cells[1].innerHTML = content;
          row.cells[2].firstChild.defaultValue = content;
        }
      }
    })
    .fail(()=>{
      alert("Could not get timing settings ...");
    });
}

function configPulser(chn) {
  let colN = 2 * Number(pulser[chn - 1]);
  let is2Step = timingTab.rows[2].cells[colN].firstChild.value;
  let setting = {"chn": chn};
  for (var i = 0, leni = attr.length; i < leni; i++) {
    setting[attr[i]] = parseInt(timingTab.rows[2 + i].cells[colN].firstChild.value);
  }
  for (var i = 0, leni = rfAttr.length; i < leni; i++) {
    setting[rfAttr[i]] = parseInt(timingTab.rows[9 + i].cells[colN].firstChild.value);
  }

  return new Promise((resolve, reject)=>{
    $.ajax({
      type: 'POST',
      url: baseUrl + '/timing',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(setting),
      traditional: true,
      success: (res) =>{
        resolve(true);
        console.log(res + ", timing on pulser " + chn +
          " is configured successfully: " + JSON.stringify(setting));
        showTimingInfo();
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Could not config pulser timing" + err.responseText);
      }});
  })
}
