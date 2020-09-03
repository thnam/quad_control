const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const config = require('config');

router
  .get('/', async(req, res, next) => {
    try {
      const info = await require(global.appRoot + "/utils/dbTools").getGlobalInhibit();
      // httpLog.info(JSON.stringify(info));
      // httpLog.info(info.inhibit);
      res.json(info[0]);
    } catch (e) {
      next (e);
    }
  });

module.exports = router;
