const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const config = require('config');
const BUEnv = config.BUEnv;
const dbTools = require(global.appRoot + "/utils/dbTools");

router
  .get('/', async(req, res, next) => {
    var cmd = global.appRoot + "/../hwInterface/bu/checkPulserEnabled";
    exec(cmd, {env: BUEnv}).then((data)=>{
      httpLog.info("Read enabled pulsers successfully.");
      setting = JSON.parse(data.stdout.toLowerCase());
      httpLog.info(setting);
      res.status(200).json(setting);
    }).catch((err)=>{
      httpLog.error("Cannot read enabled pulsers: " + err.stderr);
      res.status(500).send(err.stderr);
    });
  })
  .post("/", (req, res, next) => {
    const r = req.body;
    httpLog.info("Pulser enable request: " + JSON.stringify(r));

    let cmd = "";
    cmd += global.appRoot + "/../hwInterface/bu/";
    if (r.enable === 0) {
      cmd += "disablePulser";
    }
    else if (r.enable === 1) {
      cmd += "enablePulser";
    }

    cmd += " -p " + r.pulser;

    exec(cmd, {env: BUEnv}).then((data)=>{
      httpLog.info("Pulser enable request" + r.pulser);
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error("Config unsucessfully, " + err.stderr);
      res.status(500).send(err.stderr);
    });
  });

module.exports = router;
