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
  });
module.exports = router;
