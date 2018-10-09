// This class periodically reads out currents and voltages from the Labjack
const config = require('config');
const exec = require('child_process').exec;

global.appRoot = require('app-root-path').toString();
const cvLogger = require(global.appRoot + '/loggers/cvLogger.js');
const statusLogger = require(global.appRoot + '/loggers/statusLogger.js');

const cvDataCmd = appRoot + '/../hwInterface/ljCVData.py';
// const cvDataCmd = appRoot + '/../hwInterface/fakeCVData.py';
const statusDataCmd = appRoot + '/../hwInterface/fakePulserStatus.py';

setInterval( () => {
    const command = exec(cvDataCmd);
    var cv = {};
    command.stdout.on('data', function(data){
      cv = JSON.parse(data);
      cv["error"] = false;
      cvLogger.info(JSON.stringify(cv));
    });

    command.stderr.on('error', function(err){
      cv["error"] = true;
      // capture the error message, remove extra characters only useful on
      // console
      cv["message"] = JSON.stringify(err).slice(1, -4);
      cvLogger.info(JSON.stringify(cv));
    });


  }, config.get("logger.voltagePollingPeriod")
);

setInterval( () => {
    const command = exec(statusDataCmd);
    var pulserState = {};
    command.stdout.on('data', function(data){
      pulserState = JSON.parse(data);
      pulserState["error"] = false;
      statusLogger.info(JSON.stringify(pulserState));
    });

    command.stderr.on('error', function(err){
      pulserState["error"] = true;
      pulserState["message"] = JSON.stringify(err).slice(1, -4);
      statusLogger.info(JSON.stringify(pulserState));
    });


  }, config.get("logger.pulserStatePollingPerios")
);
