const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);

// use the same route for both set and get pulse mode
router
  .post("/", (req, res, next) => {
    const ps = req.body.ps;
    const env = req.app.get("env");
    httpLog.info("Fault reset requested"); 

    let cmd = "";
    if (env === "production") {
      cmd += global.appRoot + "/../hwInterface/lj/ljPulserReset.py " + ps;
    } else 
      cmd += global.appRoot + "/../hwInterface/success 2";

    httpLog.info(cmd);
    exec(cmd).then((data)=>{
      httpLog.info(data.stdout);
      httpLog.info(ps + " has been reset");
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error(err);
      httpLog.error("Error while trying to reset " + ps);
      httpLog.error("ljPulserReset stderr: " + err);
      res.status(500).send("Cannot reset " + ps + ", " + err.stderr);
    });
  }) ;
module.exports = router;
