async function getVoltage() { // get last entry from voltage db
  const ret = await $.ajax({
    type: 'GET',
    url: baseUrl + '/lastcv',
    success: function(data) { },
    error: (xhr)=>{
      alert("Error", xhr);
    },
  })
  return ret.meta;
};

function setVoltage(vSet) { // send voltage request to server
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "POST",
      url: baseUrl + "/cv",
      data: vSet,
      success: (res) => { // confirm the voltage first, then done
        window.inTransition = true;
        var done = setInterval(()=>{
          if (confirmVoltage(0.1))
            clearInterval(done); 
        }, 1000);

        console.info(res + ", voltage set to " + JSON.stringify(vSet));
        resolve(true);
        window.inTransition = false;
      },
      error: (err, stat) =>{
        resolve(false);
        alert("Could not set voltage, error message: " + err.responseText);
      }});
  });
}

function zeroVoltage() { // should always work
  changePulseMode("Stop");
  window.ramping = false;
  window.vSet = {"pfs": 0., "pss": 0., "pos": 0., "nfs": 0., "nss": 0., "nos": 0.};
  $("#vSetpoint").val('0.0, 0.0').trigger("change");
  setVoltage(window.vSet);
};

function increaseVoltages(deltaV){
  console.info("Increase all voltages by", deltaV, "kV");

  if (window.vSet === undefined) window.vSet = {};

  window.vSet = Object.assign({}, normReadbackVoltage());
  Object.keys(window.vSet).forEach((k) => {
    window.vSet[k] = window.vSet[k] + deltaV;
    if (window.vSet[k] < 0.0) window.vSet[k] = 0.;
  })

  console.log(window.vSet);
  // do the work
  getPulseMode()
    .then((currentMode) =>{
      if (currentMode === "Stop") 
        setVoltage(window.vSet);
      else 
        setPulseMode("Stop").then(()=>{
          setVoltage(window.vSet).then(()=>{
            setPulseMode(currentMode);
          })
        })
    })
};

function rampFromZero(nextPulseMode) {
  if (nextPulseMode === undefined) {
    nextPulseMode = "1 Hz";
  }

  alert("Starting from zero, will only go to 0.8/1.6 kV, then the pulsers will be put in "
    + nextPulseMode + " pulsing mode.");
    window.vSet = {"pfs": 0.8, "pss": 1.6, "pos": 1.6,
      "nfs": 0.8, "nss": 1.6, "nos": 1.6};
    (async function startFromZero() {
      await setVoltage(window.vSet).then(async() => {
        await setPulseMode(nextPulseMode);
      });
    })();
}

function ramp() {
  getSetpoint();
  if (!validateSetpoint2(window.vSet)){ // return upon bad request 
    console.error("Bad setpoint, abort ramping function");
    return;
  }
  
  if (atZero()){
    rampFromZero("1 Hz");
    return;
  }

  readbackV = normReadbackVoltage();
  let gap = {};
  Object.keys(readbackV).forEach((k)=>{gap[k] = window.vSet[k] - readbackV[k];});
  let nStep = {};
  Object.keys(gap).forEach((k)=>{nStep[k] = Math.ceil(gap[k] / window.vStep);});
  
  console.log("Gaps: ", gap);
  console.log("nStep: ", nStep);
  let steps = [];

  for (var i = 0, len = max(nStep); i < len; i++) {
    let tmpStep = {};
    Object.keys(readbackV).forEach((chn)=>{
      // make sure the step does not overshoot final voltage
      if (i < nStep[chn] - 1)
        tmpStep[chn] = normalizeVoltage(readbackV[chn] + (i + 1) * window.vStep);
      else
        tmpStep[chn] = normalizeVoltage(window.vSet[chn]);

      if (tmpStep[chn] <= 0.) tmpStep[chn] = 0.;
    });
    steps.push(tmpStep);
  }

  // just push the final point again, this should take care of ramp down case
  steps.push(window.vSet);
  console.log(steps);
  window.ramping = true;
  toggleControlInRamping();

  console.info("Ramping in progress ...");
  doAllSteps(steps).then(()=>{
    console.info("Done ramping")
    window.ramping = false;
    toggleControlInRamping();
    return;
  });

}

async function doAllSteps(steps) {
  for (var i = 0, len = steps.length; i < len; i++) {
    console.info("Step ", i, ": ", steps[i]);
    await doVoltageStep(steps[i]);
    await delay(Math.floor(window.vInterval) * 1000);
    console.info("Done step ", i);
  }

}

async function doVoltageStep(targetV) {
  if (!validateSetpoint2(targetV)){ // return upon bad request 
    console.error("Bad setpoint, abort " + arguments.callee.name + " function");
    console.error(targetV);
    return false;
  }

  // read current voltages
  let readbackV = normReadbackVoltage();
  // calculate the gaps = targetV - readbackV, and max gap
  let gap = {};
  Object.keys(readbackV).forEach((k) => {gap[k] = targetV[k] - readbackV[k]; });
  let maxGap = max(gap);

  console.log(gap, maxGap);

  if (normalizeVoltage(maxGap) <= 0.25) {
    (async () => {
      await setVoltage(targetV);
    })();
    return true;
  }
  else {
    getPulseMode().then((currentMode) =>{
      if (currentMode === "Stop") {
        (async ()=>{ await setVoltage(targetV); })
        return true;
      }
      else {
        setPulseMode("Stop").then(async ()=>{
          await delay(1 * 1000).then(async ()=>{
            await setVoltage(targetV).then(async ()=>{
              await delay(1 * 1000).then( ()=>{ setPulseMode(currentMode); })
            });
          })
        })
        return true;
      }
    });
  }
}

function changeVoltage() {
  if (!validateSetpoint()){ // return upon bad request 
    console.error("Bad setpoint, abort changeVoltage function");
    return;
  }

  // if in manual mode, do it at once then return
  if (window.vMode == "vManual") {
    let proceed = confirm("This will set voltage directly, without ramping. Are you sure?");
    if (proceed === true) {
      setVoltage(window.vSet);
      return;
    }
    else{
      console.log("User aborted");
      return;
    }
  }

  if (!window.ramping) { // window.ramping should be determined correctly in setpoint validation
    console.warn("window.ramping =", window.ramping, ", voltage is set directly");
    setVoltage(window.vSet);
    return;
  }

  readbackV = normReadbackVoltage();
  // handle the start from 0 -> 0.8/1.6
  if (atZero()){
    // alert("Starting from zero, will only go to 0.8/1.6 kV, then the pulsers will be put in Burst mode.");
    alert("Starting from zero, will only go to 0.8/1.6 kV, then the pulsers will be put in 1 Hz mode.");
    window.vSet = {"pfs": 0.8, "pss": 1.6, "pos": 1.6,
      "nfs": 0.8, "nss": 1.6, "nos": 1.6};
    (async function startFromZero() {
      await setVoltage(window.vSet).then(async() => {
        // await setPulseMode("Burst");
        await setPulseMode("1 Hz");
      });
    })();
    return;
  }

  // if using preset, let's ramp
  console.info("Ramping in progress ...");
  // precompute the steps needed
  let nStep = {"fs": Math.ceil(window.vGap.fs / window.vStep),
    "ss": Math.ceil(window.vGap.ss / window.vStep),
    "os": Math.ceil(window.vGap.os / window.vStep)};

  let nStepMin = Math.min(nStep.fs, nStep.os, nStep.ss);
  let nStepMax = Math.max(nStep.fs, nStep.os, nStep.ss);
  console.info("Steps needed: ", nStep, ", min:", nStepMin, ", max:", nStepMax);

  let steps = [];
  if (nStepMin === 0 || nStepMax === nStepMin) { // easy, raise all every time
    for (var i = 0, len = nStepMax; i < len; i++) {
      let tmpVSet = Object.assign({}, readbackV);

      Object.keys(tmpVSet).forEach((k) => {
        tmpVSet[k] = tmpVSet[k] + (i + 1) * window.vStep;
        if (tmpVSet[k] < 0.0) tmpVSet[k] = 0.;
        if (tmpVSet[k] > window.vSet[k]) tmpVSet[k] = window.vSet[k];
      })
      if (tmpVSet.pss - tmpVSet.pfs >= 7.0) tmpVSet.pfs = tmpVSet.pss - 7.;
      if (tmpVSet.nss - tmpVSet.nfs >= 7.0) tmpVSet.nfs = tmpVSet.nss - 7.;
      steps.push(normalizeSetpoint(tmpVSet));
    }
  }
  else{ // raise second step before working on first step
    for (var i = 0, len = nStepMax - nStepMin; i < len; i++) {
      let tmpVSet = Object.assign({}, readbackV);

      Object.keys(tmpVSet).forEach((k) => {
        if ((k !== "pfs") || (k !== "nfs")) 
          tmpVSet[k] = tmpVSet[k] + (i + 1) * window.vStep;

        if (tmpVSet[k] < 0.0) tmpVSet[k] = 0.;
        if (tmpVSet[k] > window.vSet[k]) tmpVSet[k] = window.vSet[k];
      })
      if (tmpVSet.pss - tmpVSet.pfs >= 7.0) tmpVSet.pfs = tmpVSet.pss - 7.;
      if (tmpVSet.nss - tmpVSet.nfs >= 7.0) tmpVSet.nfs = tmpVSet.nss - 7.;
      steps.push(normalizeSetpoint(tmpVSet));
    }

    lastStep = steps[steps.length - 1];
    for (var i = 0; i < nStepMin; i++) {
      let tmpVSet = Object.assign({}, readbackV);

      Object.keys(tmpVSet).forEach((k) => {
        tmpVSet[k] = lastStep[k] + (i + 1) * window.vStep;
        if (tmpVSet[k] < 0.0) tmpVSet[k] = 0.;
        if (tmpVSet[k] > window.vSet[k]) tmpVSet[k] = window.vSet[k];
      })
      if (tmpVSet.pss - tmpVSet.pfs >= 7.0) tmpVSet.pfs = tmpVSet.pss - 7.;
      if (tmpVSet.nss - tmpVSet.nfs >= 7.0) tmpVSet.nfs = tmpVSet.nss - 7.;
      steps.push(normalizeSetpoint(tmpVSet));
    }
  }

  console.log(steps);

  // Do voltage steps while ramping is true
  toggleControlInRamping();
  getPulseMode()
    .then((currentMode) =>{
      if (currentMode === "Stop"){
        (async function rampWhileStopping() {
          for (let i = 0; i < steps.length; i++) {
            console.info("Step", i, ":", steps[i]);
            await setVoltage(steps[i]).then(async ()=>{
              await delay(Math.floor(window.vInterval) * 1000);
              console.info("Done step", i);
            });
          }

          window.ramping = false;
          toggleControlInRamping();
          $.jGrowl("Ramping completed", { life: 10000 });
          console.log("Ramping completed.");
        })();
      } 

      else {
        if (window.vStep > 0.2) { // stop -> start
          (async function loop() {
            for (let i = 0; i < steps.length; i++) {
              console.info("Step", i, ":", steps[i]);
              if (!window.ramping) {
                console.warn("Abort ramping");
                break;
              } 
              await setPulseMode("Stop").then(async ()=>{
                await setVoltage(steps[i]).then(async ()=>{
                  await setPulseMode(currentMode).then(async() =>{
                    await delay(Math.floor(window.vInterval) * 1000);
                    console.info("Done step", i);
                  });
                })
              })
            }
            // all done
            window.ramping = false;
            toggleControlInRamping();
            $.jGrowl("Ramping completed", { life: 10000 });
          })();
        }
        else { // dont stop if the step is lower than 0.2
          (async function loop() {
            for (let i = 0; i < steps.length; i++) {
              console.info("Step", i, ":", steps[i]);
              if (!window.ramping) {
                console.warn("Abort ramping");
                break;
              } 
              await setVoltage(steps[i]).then(async ()=>{
                await delay(Math.floor(window.vInterval) * 1000);
                console.info("Done step", i);
              })
            }
            // all done
            window.ramping = false;
            $.jGrowl("Ramping completed", { life: 10000 });
            toggleControlInRamping();
          })();
        }
      }
    })
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function abortRamping() {
  window.ramping = false;
  toggleControlInRamping();
  alert("Ramping aborted!");
}

function getSetpoint() {
  window.vMode = $('input[name=vMode]:checked').val();

  if (window.vSet === undefined) 
    window.vSet = {};

  if (window.vMode == "vPreset") {
    let str = $("#vSetpoint").val().split(",");
    window.vSet["pfs"] =  Number.parseFloat(str[0]);
    window.vSet["pss"] =  Number.parseFloat(str[1]);
    window.vSet["pos"] =  Number.parseFloat(str[1]);
    window.vSet["nfs"] =  Number.parseFloat(str[0]);
    window.vSet["nss"] =  Number.parseFloat(str[1]);
    window.vSet["nos"] =  Number.parseFloat(str[1]);
  }
  else if (window.vMode == "vManual") {
    window.vSet["pfs"] = Number.parseFloat($("#manualPFS").val());
    window.vSet["pss"] = Number.parseFloat($("#manualPSS").val());
    window.vSet["pos"] = Number.parseFloat($("#manualPOS").val());
    window.vSet["nfs"] = Number.parseFloat($("#manualNFS").val());
    window.vSet["nss"] = Number.parseFloat($("#manualNSS").val());
    window.vSet["nos"] = Number.parseFloat($("#manualNOS").val());
  }

  window.vStep = Number.parseFloat($("#vStep").val());
  window.vInterval = Number.parseFloat($("#vInterval").val());
  console.info("Voltage setpoint: " + JSON.stringify(window.vSet) + ", step: " 
    + window.vStep + ", interval: " + window.vInterval);
}

function confirmVoltage(tolerance) {
  try {
    let goodPOS = Math.abs(window.vSet["pos"] - window.vRead.os.pv) <= tolerance;
    let goodNOS = Math.abs(window.vSet["nos"] - window.vRead.os.nv) <= tolerance;
    let goodPSS = Math.abs(window.vSet["pss"] - window.vRead.ss.pv) <= tolerance;
    let goodNSS = Math.abs(window.vSet["nss"] - window.vRead.ss.nv) <= tolerance;
    let goodPFS = Math.abs(window.vSet["pfs"] - window.vRead.fs.pv) <= tolerance;
    let goodNFS = Math.abs(window.vSet["nfs"] - window.vRead.fs.nv) <= tolerance;

    return goodPOS && goodNOS && goodPSS && goodNSS && goodPFS && goodNFS;
  } catch (e) {
    return false;
  }
}

function normReadbackVoltage() {
  if (window.vRead === undefined) {
    getVoltage().then((val) =>{
      window.vRead = val; 
      return {
        "pos": normalizeVoltage(window.vRead.os.pv),
        "nos": normalizeVoltage(window.vRead.os.nv),
        "pfs": normalizeVoltage(window.vRead.fs.pv),
        "nfs": normalizeVoltage(window.vRead.fs.nv),
        "pss": normalizeVoltage(window.vRead.ss.pv),
        "nss": normalizeVoltage(window.vRead.ss.nv),
      };
    })
  }
  else
    return {
      "pos": normalizeVoltage(window.vRead.os.pv),
      "nos": normalizeVoltage(window.vRead.os.nv),
      "pfs": normalizeVoltage(window.vRead.fs.pv),
      "nfs": normalizeVoltage(window.vRead.fs.nv),
      "pss": normalizeVoltage(window.vRead.ss.pv),
      "nss": normalizeVoltage(window.vRead.ss.nv),
    };
}

function validateSetpoint() {
  getSetpoint();
  let zero = atZero();
  let goodPOS = window.vSet["pos"] >= 0.0 && window.vSet["pos"] <= 27.0;
  let goodNOS = window.vSet["nos"] >= 0.0 && window.vSet["nos"] <= 27.0;
  let goodPSS = window.vSet["pss"] >= 0.0 && window.vSet["pss"] <= 27.0;
  let goodNSS = window.vSet["nss"] >= 0.0 && window.vSet["nss"] <= 27.0;
  let goodPFS = window.vSet["pfs"] >= 0.0 && window.vSet["pfs"] <= 21.0;
  let goodNFS = window.vSet["nfs"] >= 0.0 && window.vSet["nfs"] <= 21.0;

  let gap = window.vSet["pss"] - window.vSet["pfs"];
  let goodGap = gap >= 0.3 && gap <= 7.0;

  if (window.vSet["pfs"] >= 10.0) 
    goodGap = goodGap && gap >= 3.0

  let allGood = zero || (
    goodNOS && goodPSS && goodPFS && goodNOS && goodNSS && goodNFS && goodGap);

  let readbackV = normReadbackVoltage();
  window.vGap = {
    "fs": window.vSet["pfs"] - readbackV.pfs,
    "os": window.vSet["pos"] - readbackV.pos,
    "ss": window.vSet["pss"] - readbackV.pss,
  }

  if (window.vGap.fs >= 0.2 || window.vGap.ss >= 0.2 || window.vGap.os >= 0.2)
    window.ramping = true;
  else
    window.ramping = false;

  if (!(goodPOS && goodNOS)) {
    let msg = "Bad setting: one step voltage should be \n"
    msg += "in range from 0 to 27 kV"
    alert(msg);
    return false;
  } else if (!(goodPSS && goodNSS)) {
    let msg = "Bad setting: second step voltage should be \n"
    msg += "in range from 0 to 27 kV"
    alert(msg);
    return false;
  } else if (!(goodPFS && goodNFS)) {
    let msg = "Bad setting: first step voltage should be \n"
    msg += "in range from 0 to 21 kV"
    alert(msg);
    return false;
  } else if (!goodGap){
    let msg = "Bad setting: the gap between first and second steps\n"
    msg += "should be in range from 0.3 to 7.0 kV; and larger\n"
    msg += "than 3 kV when first step is above 10 kV."
    alert(msg);
    return false;
  } 
  else
    return allGood;
}

function atZero() {
  let readbackV = normReadbackVoltage();
  return (
    readbackV.pos <= 0.1 && readbackV.pss <= 0.1 && readbackV.pfs <= 0.1 &&
    readbackV.nos <= 0.1 && readbackV.nss <= 0.1 && readbackV.nfs <= 0.1)
}

function normalizeSetpoint(setpoint) {
  Object.keys(setpoint).forEach((k) => {
    setpoint[k] = Math.round(setpoint[k] * 10) / 10;
  })
  return setpoint;
}

function normalizeVoltage(v) {
  return Math.round(v * 10) / 10;
}

function validateSetpoint2(setpoint) {
  let zero = atZero();
  let goodPOS = setpoint["pos"] >= 0.0 && setpoint["pos"] <= 27.0;
  let goodNOS = setpoint["nos"] >= 0.0 && setpoint["nos"] <= 27.0;
  let goodPSS = setpoint["pss"] >= 0.0 && setpoint["pss"] <= 27.0;
  let goodNSS = setpoint["nss"] >= 0.0 && setpoint["nss"] <= 27.0;
  let goodPFS = setpoint["pfs"] >= 0.0 && setpoint["pfs"] <= 21.0;
  let goodNFS = setpoint["nfs"] >= 0.0 && setpoint["nfs"] <= 21.0;

  let gapP = setpoint["pss"] - setpoint["pfs"];
  let gapN = setpoint["nss"] - setpoint["nfs"];
  let goodGap = gapP >= 0.3 && gapP <= 7.0 && gapN >= 0.3 && gapN <= 7.0;

  if (setpoint["pfs"] >= 10.0) 
    goodGap = goodGap && gapP >= 3.0 
  if (setpoint["nfs"] >= 10.0) 
    goodGap = goodGap && gapN >= 3.0 

  let allGood = zero || (
    goodNOS && goodPSS && goodPFS && goodNOS && goodNSS && goodNFS && goodGap);

  if (!(goodPOS && goodNOS)) {
    let msg = "Bad setting: one step voltage should be \n"
    msg += "in range from 0 to 27 kV"
    alert(msg);
    return false;
  } else if (!(goodPSS && goodNSS)) {
    let msg = "Bad setting: second step voltage should be \n"
    msg += "in range from 0 to 27 kV"
    alert(msg);
    return false;
  } else if (!(goodPFS && goodNFS)) {
    let msg = "Bad setting: first step voltage should be \n"
    msg += "in range from 0 to 21 kV"
    alert(msg);
    return false;
  } else if (!goodGap){
    let msg = "Bad setting: the gap between first and second steps\n"
    msg += "should be in range from 0.3 to 7.0 kV; and larger\n"
    msg += "than 3 kV when first step is above 10 kV."
    alert(msg);
    return false;
  } 
  else
    return allGood;
}

function max(obj) { return Math.max(...(Object.values(obj))); }
function min(obj) { return Math.min(...(Object.values(obj))); }

