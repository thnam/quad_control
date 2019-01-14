const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const { exec } = require('child_process');

// use the same route for both set and get pulse mode
router
  .post("/", (req, res, next) => {
    const ps = req.body.ps;
    const env = req.app.get("env");
    httpLog.info("Fault reset requested"); 
    try {
      let cmd = "";
      if (env === "production") {
        cmd += global.appRoot + "/../hwInterface/ljPulserReset.py " + ps;
      } else 
        cmd += global.appRoot + "/../hwInterface/success 2";

      httpLog.info(cmd);
      var child = exec(cmd);

      promiseFromChild(child).then(
        function (result) {
          httpLog.info(ps + " has been reset");
          res.sendStatus(200);
        }, 
        function (err) {
          httpLog.error(err);
          httpLog.error("Error while trying to reset " + ps);
          res.sendStatus(500);
          throw(err);
        }
      );
    } catch (e) {
      next(e);
    }

    child.stdout.on("data", function (data) {
      httpLog.info("ljPulserReset stdout: " + data);
    });

    child.stderr.on("data", function (data){
      httpLog.error("ljPulserReset stderr: " + data);
    });

    child.on("close", function(code){
      httpLog.info("ljPuslerReset code:" + code);
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
