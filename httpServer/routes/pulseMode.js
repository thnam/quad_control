const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const spawn = require('child_process').spawn;
const { exec } = require('child_process');

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
  .post("/", (req, res) => {
    const currentMode = req.body.currentMode;
    const newMode = req.body.newMode;
    
    const env = req.app.get("env");
    httpLog.info("Env: " + env);

    httpLog.info("Pulse mode change request: from " + currentMode + " to " + newMode); 
    // do some hardware stuff here, should be try/catch and 
    try {
      // if (newMode == "Stop") {
      let cmd = "";
      if (env === "production") {
        cmd += global.appRoot + "/../hwInterface/setPulseModeWrapper.sh";
        cmd += ' "' + newMode + '"';
      } else 
        cmd += global.appRoot + "/../hwInterface/success";

      httpLog.info(cmd);

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          httpLog.error(err);
          httpLog.error("Error while changing pulse mode to " + newMode);
          res.sendStatus(500);
          throw(err);
        }

        httpLog.info("Changed pulse mode to " + newMode);
        modeLog.info(newMode);
        res.sendStatus(200);

      });
      // }
    } catch (e) {
      next(e);
    }
  })
;

module.exports = router;
