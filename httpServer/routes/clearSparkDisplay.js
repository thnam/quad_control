const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);

// use the same route for both set and get pulse mode
router
  .post("/", (req, res, next) => {
    const env = req.app.get("env");
    httpLog.info("Spark display clear requested."); 
    let cmd = "";
    if (env === "production") {
      // camac interface
      cmd += global.appRoot + "/../hwInterface/lj/camacSparkCountReset.sh";
    } else 
      cmd += global.appRoot + "/../hwInterface/success 2";

    httpLog.info(cmd);
    var child = exec(cmd);
    exec(cmd).then((data)=>{
      httpLog.info("Spark display cleared");
      res.sendStatus(200);
    }).catch((err)=>{
      httpLog.error(err);
      httpLog.error("Error while clearing spark display");
      res.status(500).send("Cannot clear spark display " + err.stderr);
    });
  });

module.exports = router;
