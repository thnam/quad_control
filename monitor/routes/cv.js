const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const { exec } = require('child_process');

router
  .get('/', async (req, res, next) => {
    const cv = await dbTool.getCV();
    res.json(cv);
  });

module.exports = router;
