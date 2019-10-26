const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const { exec } = require('child_process');

// use the same route for both set and get pulse mode
router
  .get('/', async(req, res, next) => {
    const thr = await dbTool.getSparkThreshold();
    res.json(thr);
  })
  // .post("/", (req, res, next) => {
  // });

module.exports = router;
