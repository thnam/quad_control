// This class periodically reads out currents and voltages from the Labjack
const config = require('config');
const exec = require('child_process').exec;

global.appRoot = require('app-root-path').toString();
const cvLogger = require(global.appRoot + '/loggers/cvLogger.js');
const statusLogger = require(global.appRoot + '/loggers/statusLogger.js');
const sparkLogger = require(global.appRoot + '/loggers/sparkLogger.js');

// Fake data
// const cvDataCmd = appRoot + '/../hwInterface/fakeCVData.py';
// const statusDataCmd = appRoot + '/../hwInterface/fakePulserStatus.py';
// const sparkDataCmd = appRoot + "/../hwInterface/fakeSparkData.py";

// Labjack data
const cvDataCmd = appRoot + '/../hwInterface/ljCVData.py';
const statusDataCmd = appRoot + '/../hwInterface/ljPulserStatus.py';
const sparkDataCmd = appRoot + "/../hwInterface/ljSparkData.py";
//
// BU electronics data
// const statusDataCmd = appRoot + '/../hwInterface/fakePulserStatus.py';

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
      cvLogger.error(JSON.stringify(cv));
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
      statusLogger.error(JSON.stringify(pulserState));
    });


  }, config.get("logger.pulserStatePollingPeriod")
);

setInterval( () => {
    const command = exec(sparkDataCmd);
    var spark = {};
    command.stdout.on('data', function(data){
      spark = JSON.parse(data);
      spark["error"] = false;
      statusLogger.info(JSON.stringify(spark));
    });

    command.stderr.on('error', function(err){
      spark["error"] = true;
      spark["message"] = JSON.stringify(err).slice(1, -4);
      sparkLogger.error(JSON.stringify(spark));
    });

  }, config.get("logger.pulserStatePollingPeriod")
);
