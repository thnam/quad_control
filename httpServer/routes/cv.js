const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const modeLog = require(global.appRoot + '/loggers/pulseModeLogger.js');
const dbTool = require(global.appRoot + "/utils/dbTools.js");

router.get('/', async (req, res, next) => {
  const cv = await dbTool.getOnlineCV();
  res.json(cv);
});

module.exports = router;
