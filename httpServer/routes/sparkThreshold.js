const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const config = require('config');

// use the same route for both set and get pulse mode
router
  .get('/', async(req, res, next) => {
    const thr = await dbTool.getSparkThreshold();
    res.json(thr);
  })
  .post("/", (req, res, next) => {
    const env = req.app.get("env");
    const thresholds = req.body;
    httpLog.info("Received threshold requests: " + JSON.stringify(thresholds));
    let cmd = "";
    if (env === "production") {
      if (config.controller === "BU") {
        cmd = global.appRoot + "/../hwInterface/bu/armSparkDetection";
        cmd += " " + thresholds.low + " " + thresholds.high;
      }
      if (config.controller === "Sten") {
        cmd = global.appRoot + "/../hwInterface/lj/ljSparkThreshold.py"
        cmd += " " + thresholds.slot3;
      }
    } else 
      cmd += global.appRoot + "/../hwInterface/dummy/success 2";

    httpLog.info("Command:" + cmd);
    exec(cmd, {env: config.BUEnv}).then(()=>{
      httpLog.info("Threshold set to " + JSON.stringify(thresholds));
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error("Could not set threshold");
      httpLog.error(err.stderr);
      res.status(500).send(err.stderr);
    });
  });

module.exports = router;
