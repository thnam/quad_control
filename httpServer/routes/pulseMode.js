const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');

// use the same route for both set and get pulse mode
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
    httpLog.info("Pulse mode change request: from", req.body.currentMode, "to",
      req.body.newMode); 
    // do some hardware stuff here first, should be try/catch and 
    // .....
    // then change mode info accordingly
    modeLog.info(req.body.newMode);
    res.sendStatus(200);
  })
;

module.exports = router;
