const express = require('express');
const router = express.Router();
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const exec = require('util').promisify(require('child_process').exec);
const BUEnv = require('config').BUEnv;
router
  .post('/', async(req, res, next) => {
  };

module.exports = router;
