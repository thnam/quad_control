const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const BUEnv = require('config').BUEnv;

// use the same route for both set and get pulse mode
router
  .get('/', async(req, res, next) => {
    const thr = await dbTool.getSparkThreshold();
    res.json(thr);
  });

module.exports = router;
