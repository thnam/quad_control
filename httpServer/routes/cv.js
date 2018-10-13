const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const { exec } = require('child_process');

router
  .get('/', async (req, res, next) => {
    const cv = await dbTool.getCV();
    res.json(cv);
  })
  .post("/", (req, res, next) => {
    const vSet = req.body;
    const env = req.app.get("env");

    httpLog.info("Voltage change request: " + JSON.stringify(vSet));

    try {
      let cmd = "";
      if (env == "production") {
        cmd = appRoot + '/../hwInterface/ljSetVoltage.py';
        cmd += " " + vSet.fs + " " + vSet.ss + " " + vSet.os;
      } else {
        cmd = appRoot + '/../hwInterface/fakeCVData.py';
        cmd += " " + vSet.fs + " " + vSet.ss + " " + vSet.os;
      }
      httpLog.info("Voltage command: " + cmd);
      
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          httpLog.error(err);
          httpLog.error("Error while setting voltage to " + JSON.stringify(vSet));
          res.sendStatus(500);
          throw(err);
        }

        httpLog.info("Voltage set to " + JSON.stringify(vSet));
        res.sendStatus(200);
      });
    } catch (e) {
      next(e);
    };
  });

module.exports = router;
