const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const { exec } = require('child_process');

// use the same route for both set and get pulse mode
router
  .get('/', async(req, res, next) => {
    try {
      const spark = await require(global.appRoot + "/utils/dbTools").getSparkInfo();
      res.json(spark);
    } catch (e) {
      next (e);
    }
  })

module.exports = router;
