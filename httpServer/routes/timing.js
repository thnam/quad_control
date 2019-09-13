const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const BUEnv = require('config').BUEnv;

router
  .get('/', async(req, res, next) => {
    var cmd = global.appRoot + "/../hwInterface/bu/readPulserTiming";

    exec(cmd, {env: BUEnv}).then((data)=>{
      httpLog.info("Read pulser timing successfully");
      console.log(data.stdout);
      res.status(200).json(JSON.parse(data.stdout));
    }).catch((err)=>{
      httpLog.error("Cannot read pulser timing, " + err.stderr);
      res.status(500).send(err.stderr);
    });
  })

module.exports = router;
