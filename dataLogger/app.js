// This class periodically reads out currents and voltages from the Labjack
const config = require('config');
const exec = require('child_process').exec;
const exec2 = require('util').promisify(require('child_process').exec);
const BUEnv = require('config').BUEnv;

global.appRoot = require('app-root-path').toString();
const cvLogger = require(global.appRoot + '/loggers/cvLogger.js');
const statusLogger = require(global.appRoot + '/loggers/statusLogger.js');
const sparkPatternLogger = require(global.appRoot + '/loggers/sparkPatternLogger.js');
const thrLogger = require(global.appRoot + '/loggers/sparkThresholdLogger.js');
const sparkHistLogger = require(global.appRoot + '/loggers/sparkHistoryLogger.js');
const flagLogger = require(global.appRoot + '/loggers/flagLogger.js');

const mongoClient = require('mongodb').MongoClient;

let env = process.env.NODE_ENV;
console.log("Running mode: " + env);

var dbUrl = "mongodb://";
if (env == "production") 
  dbUrl += config.get("mongo.user") + ":" + config.get("mongo.password") + "@";
dbUrl += config.get("mongo.host") + ":" + config.get("mongo.port").toString() +
  "/" + config.get("mongo.db");

setFlag(false, false);

var flag;
(async function aaa(){
  flag = await readFlag();
  console.log(flag);
})();

var cvDataCmd, sparkDataCmd, statusDataCmd;

if (env == "development") { // Fake data
  cvDataCmd = appRoot + '/../hwInterface/dummy/fakeCVData.py';
  statusDataCmd = appRoot + '/../hwInterface/dummy/fakePulserStatus.py';
  sparkDataCmd = appRoot + "/../hwInterface/dummy/fakeSparkData.py";
  sparkThresholdCmd = appRoot + "/../hwInterface/dummy/fakeSparkThreshold.py";
} else{
  // Labjack data
  cvDataCmd = appRoot + '/../hwInterface/lj/ljCVData.py';
  statusDataCmd = appRoot + '/../hwInterface/lj/ljPulserStatus.py';
  // sparkDataCmd = appRoot + "/../hwInterface/lj/ljSparkData.py";
  // sparkThresholdCmd = appRoot + "/../hwInterface/lj/ljSparkThreshold.py";
  // BU electronics data
  // const statusDataCmd = appRoot + '/../hwInterface/fakePulserStatus.py';
  sparkDataCmd = appRoot + "/../hwInterface/bu/getSparkStatus";
  sparkThresholdCmd = appRoot + "/../hwInterface/bu/readSparkThreshold";
}


setInterval( () => {
    const command = exec(cvDataCmd);
    var cv = {};
    command.stdout.on('data', function(data){
      cv = JSON.parse(data);
      cv["error"] = false;
      cvLogger.info({message: " ", meta: cv});

      // if sparks, record the pattern in the sparkHistory collection, and
      // reset the spark pin,
      if (cv.spark >= 2.) {
        // this is NIM/camac way to handle spark, lets skip this for BU box
      }

    });

    command.stderr.on('error', function(err){
      cv["error"] = true;
      // capture the error message, remove extra characters only useful on
      // console
      cv["message"] = JSON.stringify(err).slice(1, -4);
      cvLogger.error({message: " ", meta: cv});
    });


  }, config.get("logger.voltagePollingPeriod")
);

setInterval( () => {
    const command = exec(statusDataCmd);
    var pulserState = {};
    command.stdout.on('data', function(data){
      pulserState = JSON.parse(data);
      pulserState["error"] = false;
      statusLogger.info({message: " ", meta: pulserState});
    });

    command.stderr.on('error', function(err){
      pulserState["error"] = true;
      pulserState["message"] = JSON.stringify(err).slice(1, -4);
      statusLogger.error({message: " ", meta: pulserState});
    });


  }, config.get("logger.pulserStatePollingPeriod")
);

// Periodic spark pattern for online display
setInterval( () => {
  exec2(sparkDataCmd, {env: BUEnv})
    .then((data)=>{
      pattern = JSON.parse(data.stdout);
      pattern["error"] = false;
      sparkPatternLogger.info({message: " ", meta: pattern});
    })
    .catch((err)=>{
      pattern["error"] = true;
      pattern["message"] = JSON.stringify(err.stderr);
      sparkPatternLogger.error({message: " ", meta: pattern});
    })

  }, config.get("logger.sparkPollingPeriod")
);

// Spark threshold, periodically read, just for the record
setInterval( () => {
  exec2(sparkThresholdCmd, {env: BUEnv})
    .then((data)=>{
      console.log(data.stdout);
      thrLogger.info(" ", {meta:JSON.parse(data.stdout)});
    })
    .catch((err)=>{
      console.error(err.stderr);
      thrLogger.error(" ",{meta: JSON.stringify(err.stderr)});
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

