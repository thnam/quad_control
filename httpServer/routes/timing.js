const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const timingLog = require(global.appRoot + '/loggers/timingLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const BUEnv = require('config').BUEnv;
const controller = require('config').controller;

router
  .get('/', async(req, res, next) => {
    var cmd;
    if (controller === "BU")
      cmd = global.appRoot + "/../hwInterface/bu/readPulserTiming";
    else if (controller === "Sten")
      cmd = global.appRoot + "/../hwInterface/lj/ljPulserTiming.py";

    exec(cmd, {env: BUEnv}).then((data)=>{
      httpLog.info("Read pulser timing successfully");
      setting = JSON.parse(data.stdout.toLowerCase());
      timingLog.info({message: "read", meta: setting});
      res.status(200).json(setting);
    }).catch((err)=>{
      httpLog.error("Cannot read pulser timing, " + err.stderr);
      res.status(500).send(err.stderr);
    });
  })

  .post("/", (req, res, next)=>{
    const s = req.body;
    httpLog.info("Timing config request: " + JSON.stringify(s));

    // rf
    let cmd = "";
    if (s.rf_width > 0){
      cmd += global.appRoot + "/../hwInterface/bu/configRFPulser";
      cmd += " " + s.chn + " " + s.rf_delay1 + " " + s.rf_delay2 +
        " " + s.rf_delay3 + " " + s.rf_delay4;
      cmd += " " + s.rf_width + " && ";
    }
    else
      httpLog.info("No RF config since width is 0");

    cmd += global.appRoot + "/../hwInterface/bu/configSparePulser";
    cmd += " " + s.chn + " " + s.spare_length + " " + s.spare_start + " && ";

    // pulser
    cmd += global.appRoot + "/../hwInterface/bu/configPulser";
    if (s.enable_2step === 1) {
      cmd += " " + s.chn + " " + s.charge_start +
        " " + (s.step1_end - s.charge_start) + " " + s.step2_start +
        " " + (s.charge_end - s.step2_start) + " " + s.discharge_start +
        " " + (s.discharge_end - s.discharge_start);
      httpLog.info("Command: " + cmd);
    }
    else if(s.enable_2step === 0){
      cmd += " " + s.chn + " " + s.charge_start +
        " " + (s.charge_end - s.charge_start) +
        " " + s.discharge_start + " " + (s.discharge_end - s.discharge_start);
      httpLog.info("Command: " + cmd);
    }

    exec(cmd, {env: BUEnv}).then((data)=>{
      httpLog.info("Timing config done for pulser " + s.chn);
      timingLog.info({message: "change", meta: s});
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error("Config unsucessfully, " + err.stderr);
      res.status(500).send(err.stderr);
    });

  });

module.exports = router;
