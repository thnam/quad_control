const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);

router
  .post("/", (req, res, next) => {
    const env = req.app.get("env");
    httpLog.info("Set volt-div and t-div"); 
    let cmd = "";
    cmd += global.appRoot + "/../hwInterface/misc/setVdiv.sh";

    httpLog.info(cmd);
    var child = exec(cmd);
    exec(cmd).then((data)=>{
      httpLog.info("Done!");
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error(err);
      httpLog.error("Error while setting volt-div and time-div");
      res.status(500).send("Cannot set volt-div and time-div:" + err.stderr);
    });
  });

module.exports = router;
