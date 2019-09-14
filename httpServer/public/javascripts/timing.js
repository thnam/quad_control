function showTimingInfo() {
  let pulser = ["1", "2", "3", "4"];
  let timingTab = document.getElementById("timingInfoTable");
  let attr = ["enable_2step", "charge_start", "step1_end",
    "step2_start", "charge_end", "discharge_start", "discharge_end"];
  let state = ["active", "proposed"];

  $.get(baseUrl + "/timing")
    .done((data)=>{
      let tInfo = data.pulser;
      for (var i = 0, len = pulser.length; i < len; i++) {
        for (var k = 0, lenk = attr.length; k < lenk; k++) {
          let row = timingTab.rows[k + 2];
          for (var j = 0, lenj = state.length; j < lenj; j++) {
            let colN = [1 + 2 * i + j];
            let content = tInfo[pulser[i]][state[j]][attr[k]];
            if (j === 0) { //active
              if (!([2, 3].includes(k))) {
                row.cells[colN].innerHTML = content;
              }
              else{
                let is2Step = Number(tInfo[pulser[i]][state[j]][attr[0]]);
                if (is2Step) 
                  row.cells[colN].innerHTML = content;
                else 
                  row.cells[colN].innerHTML = "N/A";
              }
            } else {
              row.cells[colN].firstChild.defaultValue = Number(content);
            }
          }
        }
      }
    })
    .fail(()=>{
      alert("Could not get timing settings ...");
    })

}
