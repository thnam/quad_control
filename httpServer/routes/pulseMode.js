const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const config = require('config');
const BUEnv = config.BUEnv;

// use the same route for both set and get pulse mode
router
  .get('/', async(req, res, next) => {
    try {
      const currentMode = await require(global.appRoot + "/utils/dbTools").getPulseMode();
      res.json(currentMode);
    } catch (e) {
      next (e);
    }
  })
  .post("/", (req, res, next) => {
    const newMode = req.body.mode;
    const env = req.app.get("env");
    httpLog.info("Pulse mode set request: " + newMode); 
    // try {
    let cmd = "";
    if (env === "production") {
      // BU electronics interface
      if (config.controller === "BU") {
        cmd += global.appRoot + "/../hwInterface/bu/setPulseMode";
        cmd += ' -m "' + newMode + '"';
      }
      else if (config.controller === "Sten") {
        cmd += global.appRoot + '/../hwInterface/lj/ljPulseMode.py';
        switch (newMode) {
          case 'Stop':
            cmd += ' ' + newMode;
            break;
          case 'Burst':
            cmd += ' ' + newMode;
            break;
          case 'External':
            cmd += ' ' + newMode;
            break;
          default:
            cmd += ' periodic ' + newMode.replace(/\D/g, "");
            break;
        }
      }
    } else 
      cmd += global.appRoot + "/../hwInterface/success 2";

    httpLog.info("Command:" + cmd);
    exec(cmd, {env: BUEnv}).then(()=>{
      httpLog.info("Changed pulse mode to " + newMode);
      modeLog.info(newMode);
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error("Error while changing pulse mode to " + newMode);
      httpLog.error(err.stderr);
      res.status(500).send(err.stderr);
    });
  });

module.exports = router;
