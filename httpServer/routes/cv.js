const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');

router
  .get('/', async (req, res, next) => {
  const cv = await dbTool.getCV();
  res.json(cv);
  })
  .post("/", (req, res) => {
    const vSet = req.body;
    httpLog.info("Voltage change request: " + JSON.stringify(vSet));
    res.sendStatus(200);
  });

module.exports = router;
