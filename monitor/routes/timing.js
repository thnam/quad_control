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
  });

module.exports = router;
