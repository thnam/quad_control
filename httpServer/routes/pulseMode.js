var express = require('express');
var router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');

router
  .get('/', async(req, res, next) => {
    try {
      const currentMode = await require(global.appRoot + "/utils/dbTools").getPulseMode();
      res.json(currentMode);
    } catch (e) {
      next (e);
    }
  })
  .post("/", (req, res) => {
    httpLog.info("Pulse mode change request: from", req.body.current, "to",
      req.body.new); 
    // do some hardware stuff here first
    modeLog.info(req.body.new);
    res.sendStatus(200);
  })
;

module.exports = router;
