const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);

// re-arm the spark detection
router
  .post("/", (req, res, next) => {
    const env = req.app.get("env");
    httpLog.info("Spark display clear requested."); 
      res.sendStatus(200);
  });

module.exports = router;
