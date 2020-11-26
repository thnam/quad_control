
let timingTab = document.getElementById("timingInfoTable");

var pulser, attr, rfAttr, state, spareAttr;
// if (window.controller === "BU") {
  pulser = ["1", "2", "3", "4"];
  attr = ["enable_2step", "charge_start", "step1_end",
    "step2_start", "charge_end", "discharge_start", "discharge_end"];
  rfAttr = ["width", "delay1", "delay2", "delay3", "delay4"];
  state = ["active", "proposed"];
  spareAttr = ["length", "start"];
// }
// else {
  // attr = ["os", "fs", "fs2ss", "ss", "ss2dis", "dis"];
// }
// Declaring the parameters as constant makes things easier down the road
// see https://dbweb5.fnal.gov:8443/ECL/gm2/E/show?e=24183 for nominal timing
// (as of 03/25/2018)
const presetTiming = {
  "nominal" : {
    "1":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":1,"step1_end":35010,"step2_start":30010},
    "4":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":1,"step1_end":35010,"step2_start":30010},
    "2":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":0,"step1_end":35000,"step2_start":30000},
    "3":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":0,"step1_end":35000,"step2_start":30000}
  },
  "POS100ms" : {
    "1":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":1,"step1_end":35010,"step2_start":30010},
    "4":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":1,"step1_end":35010,"step2_start":30010},
    "2":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":0,"step1_end":35000,"step2_start":30000},
    "3":{"charge_end":100030010,"charge_start":10,"discharge_end":100740010,"discharge_start":100040010,"enable_2step":0,"step1_end":30010,"step2_start":35010}
  },
  "Option4" : {
    "1":{"charge_end":775010,"charge_start":10,"discharge_end":1480010,"discharge_start":780010,"enable_2step":1,"step1_end":35010,"step2_start":30010},
    "4":{"charge_end":100030010,"charge_start":10,"discharge_end":100740010,"discharge_start":100740010,"enable_2step":1,"step1_end":35010,"step2_start":30010},
    "2":{"charge_end":100030010,"charge_start":10,"discharge_end":100740010,"discharge_start":100740010,"enable_2step":0,"step1_end":30010,"step2_start":35010},
    "3":{"charge_end":100030010,"charge_start":10,"discharge_end":100740010,"discharge_start":100040010,"enable_2step":0,"step1_end":30010,"step2_start":35010}
  }
};

const nominal_charge_width = presetTiming.nominal["1"].charge_end - presetTiming.nominal["1"].charge_start;

function refreshTimingInfo() {
  $.get(baseUrl + "/timing")
    .done((data)=>{
      if (window.controller === "BU") {
        let pulserInfo = data.pulser;
        let charge_width = [];
        for (var i = 0, len = pulser.length; i < len; i++) {
          for (var k = 0, lenk = attr.length; k < lenk; k++) {
            let row = timingTab.rows[k + 2];
            for (var j = 0, lenj = state.length; j < lenj; j++) {
              let colN = [1 + 2 * i + j];
              let content = pulserInfo[pulser[i]][state[j]][attr[k]];
              if (j === 0) { //active
                if (!([2, 3].includes(k))) {
                  row.cells[colN].innerHTML = content.toLocaleString('en-US');
                }
                else{
                  let is2Step = (pulserInfo[pulser[i]][state[j]][attr[0]]);
                  if (is2Step) 
                    row.cells[colN].innerHTML = content.toLocaleString("en-US");
                  else 
                    row.cells[colN].innerHTML = "N/A";
                }
              } else {
                row.cells[colN].firstChild.defaultValue = (content);
              }
            }
          }
          charge_width.push(pulserInfo[pulser[i]].active.charge_end - pulserInfo[pulser[i]].active.charge_start);
        }

        let long_pulse = false;
        charge_width.forEach((w) => {
          if (w > nominal_charge_width) 
            long_pulse = true;
        });
        if (long_pulse) {
          document.getElementById("btnInternal5Hz").disabled = true; 
          document.getElementById("btnInternal2Hz").disabled = true; 
          document.getElementById("btnInternal10Hz").disabled = true; 
          document.getElementById("btnInternalBurst").disabled = true; 
        }
        else {
          document.getElementById("btnInternal5Hz").disabled = false; 
          document.getElementById("btnInternal2Hz").disabled = false; 
          document.getElementById("btnInternal10Hz").disabled = false; 
          document.getElementById("btnInternalBurst").disabled = false; 
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

        let spareInfo = data.spare;
        for (var i = 0, len = pulser.length; i < len; i++) {
          for (var k = 0, lenk = spareAttr.length; k < lenk; k++) {
            for (var j = 0, lenj = state.length; j < lenj; j++) {
              let colN = [1 + 2 * i + j];
              let row = timingTab.rows[13 + k + 1];
              if (j === 0) 
                if (spareInfo[pulser[i]]["en"] === 1) 
                  row.cells[colN].innerHTML = spareInfo[pulser[i]][spareAttr[k]];
                else 
                  row.cells[colN].innerHTML = "0";
              else
                if (spareInfo[pulser[i]]["en"] === 1) 
                  row.cells[colN].firstChild.defaultValue = spareInfo[pulser[i]][spareAttr[k]];
                else 
                  row.cells[colN].firstChild.defaultValue = 0;
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

async function sendConfigTimingRequest(chn, setting) {
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
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Could not config pulser", chn, err.responseText);
      }});
  })
}

async function configPulser(chn) {
  let colN = 2 * Number(pulser[chn - 1]);
  let is2Step = timingTab.rows[2].cells[colN].firstChild.value;
  let setting = {"chn": chn};
  for (var i = 0, leni = attr.length; i < leni; i++) {
    setting[attr[i]] = parseInt(timingTab.rows[2 + i].cells[colN].firstChild.value.replace(/,/g, ''));
  }
  for (var i = 0, leni = rfAttr.length; i < leni; i++) {
    setting["rf_" + rfAttr[i]] = parseInt(timingTab.rows[9 + i].cells[colN].firstChild.value.replace(/,/g,''));
  }
  for (var i = 0, leni = spareAttr.length; i < leni; i++) {
    setting["spare_" + spareAttr[i]] = parseInt(timingTab.rows[14 + i].cells[colN].firstChild.value.replace(/,/g, ''));
  }

  let ret = await sendConfigTimingRequest(chn, setting);
  refreshTimingInfo();
}


async function loadPresetTiming(config) {
  let current_setting = await $.get(baseUrl + "/timing");

  for (var i_chn = 1; i_chn <= 4; i_chn++){
    let setting = {"chn": i_chn};
    Object.entries(current_setting["rf"][i_chn]).forEach(entry => {
      const [key, value] = entry;
      setting["rf_" + key] = value;
    });
    Object.entries(current_setting["spare"][i_chn]).forEach(entry => {
      const [key, value] = entry;
      setting["spare_" + key] = value;
    });
    Object.entries(presetTiming[config][i_chn]).forEach(entry =>{
      const [key, value] = entry;
      setting[key] = value;
    })

    let ret = await sendConfigTimingRequest(i_chn, setting);
  }

  refreshTimingInfo();
}

function toggleEnablePulser(pulser) {
  console.log(pulser);
  let id = "cbEnablePulser" + pulser.toString();
  let req = {"pulser": pulser,
    "enable": document.getElementById(id).checked
  };

  return new Promise((resolve, reject)=>{
    $.ajax({
      type: 'POST',
      url: baseUrl + '/pulser',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(req),
      traditional: true,
      success: (res) =>{
        resolve(true);
        console.log(req, "succeeded");
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Could not enable/disable pulser " + pulser.toString() + ": " + err.responseText);
      }});
  })


}

async function readEnabledPulsers() {
  const ret = await $.ajax({
    type: 'GET',
    url: baseUrl + '/pulser',
    success: function(data) {
    },
    error: (xhr)=>{
      resolve(false);
    },
  })

  for (const [key, value] of Object.entries(ret)) {
    if (value === 1) {
      $(`#cbEnablePulser${key}`).bootstrapToggle('on', true);
    }
    else if (value === 0) {
      $(`#cbEnablePulser${key}`).bootstrapToggle('off', true);
    }
  }
}

function NumericInput(inp, locale) {
  var numericKeys = '0123456789';

  // restricts input to numeric keys 0-9
  inp.addEventListener('keypress', function(e) {
    var event = e || window.event;
    var target = event.target;

    if (event.charCode == 0) {
      return;
    }

    if (-1 == numericKeys.indexOf(event.key)) {
      // Could notify the user that 0-9 is only acceptable input.
      event.preventDefault();
      return;
    }
  });

  // add the thousands separator when the user blurs
  inp.addEventListener('blur', function(e) {
    var event = e || window.event;
    var target = event.target;

    var tmp = target.value.replace(/,/g, '');
    var val = Number(tmp).toLocaleString(locale);

    if (tmp == '') {
      target.value = '';
    } else {
      target.value = val;
    }
  });

  // strip the thousands separator when the user puts the input in focus.
  inp.addEventListener('focus', function(e) {
    var event = e || window.event;
    var target = event.target;
    var val = target.value.replace(/[,.]/g, '');

    target.value = val;
  });
}

proposed_values = document.querySelectorAll(".proposed_timing");
proposed_values.forEach((node)=>{
  new NumericInput(node);
})
