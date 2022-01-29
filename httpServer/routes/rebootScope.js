const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);

// reboot the quad scope
router
  .post("/", (req, res, next) => {
    const env = req.app.get("env");
    httpLog.info("Rebooting the scope ..."); 
    let cmd = "";
    cmd += global.appRoot + "/../hwInterface/misc/rebootScope.sh";

    httpLog.info(cmd);
    var child = exec(cmd);
    exec(cmd).then((data)=>{
      httpLog.info("Done!");
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error(err);
      httpLog.error("Error while rebooting the scope");
      res.status(500).send("Cannot reboot the scope:" + err.stderr);
    });
  });

module.exports = router;
