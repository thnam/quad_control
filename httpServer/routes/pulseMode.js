const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const { exec } = require('child_process');
const BUEnv = {
  G2QUAD_ADDRESS_TABLE: "/home/daq/ESQ/host-carrier.trunk/os/software/g2quad/tables/Carrier.adt",
  ADDRESS_TABLE_PATH: "/home/daq/ESQ/host-carrier.trunk/os/software/g2quad/tables/"
};

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
    try {
      let cmd = "";
      if (env === "production") {
        // BU electronics interface
        cmd += global.appRoot + "/../hwInterface/bu/setPulseMode";
        cmd += ' -m "' + newMode + '"';
        
        // Sten module interface
        // cmd += '/home/daq/gm2daq/frontends/ESQ_slow/quadcontrol/ljUtils/pulseControl.py --mode ';
        // cmd += ' "' + newMode + '" --ntry 3';
      } else 
        cmd += global.appRoot + "/../hwInterface/success 2";

      httpLog.info("Command:" + cmd);
      var child = exec(cmd, {env: BUEnv});

      promiseFromChild(child).then(
        function (result) {
          httpLog.info("Changed pulse mode to " + newMode);
          modeLog.info(newMode);
          res.sendStatus(200);
        }, 
        function (err) {
          httpLog.error(err);
          httpLog.error("Error while changing pulse mode to " + newMode);
          res.sendStatus(500);
          throw(err);
        }
      );
    } catch (e) {
      next(e);
    }

    child.stdout.on("data", function (data) {
      httpLog.info("setPulseMode stdout: " + data);
    });

    child.stderr.on("data", function (data){
      httpLog.error("setPulseMode stderr: " + data);
    });

    child.on("close", function(code){
      httpLog.info("setPulseMode exit code: " + code);
    })
  })
;

function promiseFromChild(child) {
  return new Promise(function (resolve, reject) {
    child.addListener("error", reject);
    child.addListener("exit", resolve);
  });
};

module.exports = router;
