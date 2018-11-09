// This class periodically reads out currents and voltages from the Labjack
const config = require('config');
const exec = require('child_process').exec;

global.appRoot = require('app-root-path').toString();
const cvLogger = require(global.appRoot + '/loggers/cvLogger.js');
const statusLogger = require(global.appRoot + '/loggers/statusLogger.js');
const sparkPatternLogger = require(global.appRoot + '/loggers/sparkPatternLogger.js');
const thrLogger = require(global.appRoot + '/loggers/sparkThresholdLogger.js');
const sparkHistLogger = require(global.appRoot + '/loggers/sparkHistoryLogger.js');
const flagLogger = require(global.appRoot + '/loggers/flagLogger.js');

const mongoClient = require('mongodb').MongoClient;
const dbUrl = "mongodb://" + config.get("mongo.user") + ":"
  + config.get("mongo.password") + "@" + config.get("mongo.host") + ":"
  + config.get("mongo.port").toString() +
  "/" + config.get("mongo.db");

let env = process.env.NODE_ENV;
console.log("Running mode: " + env);

setFlag(false, false);

var flag;
(async function aaa(){
  flag = await readFlag();
  console.log(flag);
})();

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

      // if sparks, record the pattern in the sparkHistory collection, and
      // reset the spark pin,
      if (cv.spark >= 2.) {

        if (env=="development") {
          const newCmd = (cvDataCmd + " " + cv.fs.pv + " " + cv.ss.pv +
            " " + cv.os.pv + " -0.4"); 
          const proc = exec(newCmd);
          proc.stdout.on("data", (data) => {
            console.log("Spark bit reset");
          })
        } else if (env == "production") {
          // labjack reset here
          const newCmd = exec(appRoot + "/../hwInterface/ljSparkRecover.py");
          newCmd.stdout.on("data", (data) =>{
            console.log("Spark pin reset");
          })

        }

        const patternCmd = exec(sparkDataCmd);
        var pattern = {};
        patternCmd.stdout.on('data', function(data){
          pattern = JSON.parse(data);
          pattern["error"] = false;
          pattern["sparkBit"] = cv.spark;
          sparkHistLogger.info(JSON.stringify(pattern));
        });

        patternCmd.stderr.on('error', function(err){
          pattern["error"] = true;
          pattern["sparkBit"] = cv.spark;
          pattern["message"] = JSON.stringify(err).slice(1, -4);
          sparkPatternLogger.error(JSON.stringify(pattern));
        });
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

// Periodic spark pattern for online display
setInterval( () => {
    const command = exec(sparkDataCmd);
    var pattern = {};
    command.stdout.on('data', function(data){
      pattern = JSON.parse(data);
      pattern["error"] = false;
      sparkPatternLogger.info(JSON.stringify(pattern));
    });

    command.stderr.on('error', function(err){
      pattern["error"] = true;
      pattern["message"] = JSON.stringify(err).slice(1, -4);
      sparkPatternLogger.error(JSON.stringify(pattern));
    });

  }, config.get("logger.sparkPollingPeriod")
);

// Spark threshold, periodically read, just for the record
setInterval( () => {
    const command = exec(sparkThresholdCmd);
    var thr = {};
    command.stdout.on('data', function(data){
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

// useful flags for not spamming the db 
function readFlag() {
  return mongoClient.connect(dbUrl, {useNewUrlParser: true})
    .then(function(db) {
      var collection = db.db("quad").collection("flag");
      return collection.findOne();})
    .then(function(item) {
      return JSON.parse(item.message);
  });
}

function setFlag(spark, fault) {
  flagLogger.info(JSON.stringify({"spark": spark, "fault": fault}));
}

