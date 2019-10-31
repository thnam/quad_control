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

      res.sendStatus(200);
  }) ;
module.exports = router;
