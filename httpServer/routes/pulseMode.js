const express = require('express');
const util = require('util');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const exec = util.promisify(require('child_process').exec);

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
    // try {
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
