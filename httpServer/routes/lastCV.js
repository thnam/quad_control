const express = require('express');
const router = express.Router();
const dbTool = require(global.appRoot + "/utils/dbTools.js");

const events = require('events');
const EventEmitter = events.EventEmitter;
const emitter = new EventEmitter();
const SseChannel = require('sse-channel');
const config = require('config');

router
  .get('/', async (req, res, next) => {
    const lastCV = await dbTool.getLastCV();
    res.json(lastCV[0]);
    // console.log(lastCV);
  });

setInterval(async ()=>{
  var lastCV = await dbTool.getLastCV();
  lastCV = lastCV[0].message;
  emitter.emit("lastCV", {values: lastCV});

}, config.get("logger.voltagePollingPeriod"));

module.exports = router;
