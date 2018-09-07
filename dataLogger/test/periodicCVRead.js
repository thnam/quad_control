// This class periodically reads out currents and voltages from the Labjack
var config = require('config');
const exec = require('child_process').exec;
const logger = require('../loggers/cvLogger.js');

const fakeDataCmd = './drivers/fakeCVData.py';
const realDataCmd = '';

setInterval(
  function broadcastCV() {
    const command = exec(fakeDataCmd);
    var cv = {};
    command.stdout.on('data', function(data){
      cv = JSON.parse(data);
      cv["error"] = false;
      logger.info(JSON.stringify(cv));
    });

    command.stderr.on('error', function(err){
      cv["error"] = true;
      // capture the error message, remove extra characters only useful on
      // console
      cv["message"] = JSON.stringify(err).slice(1, -4);
      logger.info(JSON.stringify(cv));
    });


  }, config.get("logger.voltagePollingPeriod"));

