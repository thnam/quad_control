// This class periodically reads out currents and voltages from the Labjack
const config = require('config');
const exec = require('child_process').exec;

global.appRoot = require('app-root-path').toString();
const cvLogger = require(global.appRoot + '/loggers/cvLogger.js');
const statusLogger = require(global.appRoot + '/loggers/statusLogger.js');
const sparkLogger = require(global.appRoot + '/loggers/sparkLogger.js');
const thrLogger = require(global.appRoot + '/loggers/sparkThresholdLogger.js');
const sparkHistLogger = require(global.appRoot + '/loggers/sparkHistoryLogger.js');

let env = process.env.NODE_ENV;
console.log("Running mode: " + env);

var cvDataCmd, sparkDataCmd, statusDataCmd;

if (env == "development") { // Fake data
  cvDataCmd = appRoot + '/../hwInterface/fakeCVData.py';
  statusDataCmd = appRoot + '/../hwInterface/fakePulserStatus.py';
  sparkDataCmd = appRoot + "/../hwInterface/fakeSparkData.py";
  sparkThresholdCmd = appRoot + "/../hwInterface/fakeSparkThreshold.py";
} else{
  // Labjack data
  cvDataCmd = appRoot + '/../hwInterface/ljCVData.py';
  statusDataCmd = appRoot + '/../hwInterface/ljPulserStatus.py';
  sparkDataCmd = appRoot + "/../hwInterface/ljSparkData.py";
  sparkThresholdCmd = appRoot + "/../hwInterface/ljSparkThreshold.py";
  // BU electronics data
  // const statusDataCmd = appRoot + '/../hwInterface/fakePulserStatus.py';
}


setInterval( () => {
    const command = exec(cvDataCmd);
    var cv = {};
    command.stdout.on('data', function(data){
      cv = JSON.parse(data);
      cv["error"] = false;
      cvLogger.info(JSON.stringify(cv));

      // if sparks, record this and pattern
      if (cv.spark >= 2.) {
        sparkHistLogger.info(JSON.stringify(cv));
      }
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
      sparkLogger.info(JSON.stringify(spark));
    });

    command.stderr.on('error', function(err){
      spark["error"] = true;
      spark["message"] = JSON.stringify(err).slice(1, -4);
      sparkLogger.error(JSON.stringify(spark));
    });

  }, config.get("logger.pulserStatePollingPeriod")
);

setInterval( () => {
    const command = exec(sparkThresholdCmd);
    var thr = {};
    command.stdout.on('data', function(data){
      console.log(data);
      thr = JSON.parse(data);
      thr["error"] = false;
      thrLogger.info(JSON.stringify(thr));
    });

    command.stderr.on('error', function(err){
      thr["error"] = true;
      thr["message"] = JSON.stringify(err).slice(1, -4);
      thrLogger.error(JSON.stringify(thr));
    });
  }, config.get("logger.sparkThresholdPollingPeriod")
);
