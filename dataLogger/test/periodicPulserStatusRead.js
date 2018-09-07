// This class periodically reads out states of pulser cabinets from the Labjack
var config = require('config');
const exec = require('child_process').exec;
const logger = require('../loggers/statusLogger.js');

const fakeDataCmd = './drivers/fakePulserStatus.py';
const realDataCmd = '';

setInterval(
  function broadcastpulserState() {
    const command = exec(fakeDataCmd);
    var pulserState = {};
    command.stdout.on('data', function(data){
      pulserState = JSON.parse(data);
      pulserState["error"] = false;
      logger.info(JSON.stringify(pulserState));
    });

    command.stderr.on('error', function(err){
      pulserState["error"] = true;
      // capture the error message, remove extra characters only useful on
      // console
      pulserState["message"] = JSON.stringify(err).slice(1, -4);
      logger.info(JSON.stringify(pulserState));
    });


  }, config.get("logger.pulserStatePollingPerios"));
