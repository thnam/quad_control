const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const { exec } = require('child_process');

// use the same route for both set and get pulse mode
router
  .post("/", (req, res, next) => {
    const env = req.app.get("env");
    httpLog.info("Spark display clear requested."); 
    try {
      let cmd = "";
      if (env === "production") {
        // camac interface
        cmd += global.appRoot + "/../hwInterface/camacSparkCountReset.sh";
      } else 
        cmd += global.appRoot + "/../hwInterface/success 2";

      httpLog.info(cmd);
      var child = exec(cmd);

      promiseFromChild(child).then(
        function (result) {
          httpLog.info("Spark display cleared");
          res.sendStatus(200);
        }, 
        function (err) {
          httpLog.error(err);
          httpLog.error("Error while clearing spark display");
          res.sendStatus(500);
          throw(err);
        }
      );
    } catch (e) {
      next(e);
    }

    child.stdout.on("data", function (data) {
      httpLog.info("clearSparkDisplay stdout: " + data);
    });

    child.stderr.on("data", function (data){
      httpLog.error("clearSparkDisplay stderr: " + data);
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
