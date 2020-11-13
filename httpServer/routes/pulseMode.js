const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const config = require('config');
const BUEnv = config.BUEnv;
const dbTools = require(global.appRoot + "/utils/dbTools");

// use the same route for both set and get pulse mode
router
  .get('/', async(req, res, next) => {
    try {
      const currentMode = await dbTools.getPulseMode();
      res.json(currentMode[0]);
    } catch (e) {
      next (e);
    }
  })
  .post("/", (req, res, next) => {
    const newMode = req.body.mode;
    const env = req.app.get("env");
    httpLog.info("Pulse mode set request: " + newMode); 

    // check for the global inhibit flag first
    //   dbTools.getGlobalInhibit().then((ret)=>{
    //     inhibit = ret.inhibit;
    //     httpLog.info("Global inhibit: " + inhibit);

    //     // if inhibit flag is active, do not allow change from stop to pulsing
    //     if (inhibit === 1 && newMode !== "Stop") {
    //       errMsg = "Could not change pulse mode to " + newMode;
    //       errMsg += " as the inhibit flag is active. Is a trolley run going on?";
    //       httpLog.error(errMsg);
    //       res.status(500).send(errMsg);
    //     }
    //     // otherwise: inhibit not active, OR, change from pulsing to Stop
    //     else {
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
              case 'CCC':
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
      // }
    // })
  });

module.exports = router;
