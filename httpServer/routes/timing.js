const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const timingLog = require(global.appRoot + '/loggers/timingLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const BUEnv = require('config').BUEnv;

router
  .get('/', async(req, res, next) => {
    var cmd = global.appRoot + "/../hwInterface/bu/readPulserTiming";

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
    if (s.width > 0){
      cmd += global.appRoot + "/../hwInterface/bu/configRFPulser";
      cmd += " " + s.chn + " " + s.delay1 + " " + s.delay2 +
        " " + s.delay3 + " " + s.delay4;
      cmd += " " + s.width + " && ";
    }
    else
      httpLog.info("No RF config since width is 0");

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
