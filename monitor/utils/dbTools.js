const db = require(global.appRoot + "/utils/db");
// const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const util = require('util');

function getPulseMode() {
  const col = db.get().db("quad").collection("pulseMode");
  return col.findOne();
}

function getLastCV() {
  const collection = db.get().db("quad").collection('cvOnline');
  const result = collection.find().sort({$natural: -1}).limit(1).toArray();
  return result;
}

function getCV() {
  const collection = db.get().db("quad").collection('cvOnline');
  const result = collection.find().sort({$natural: -1}).toArray();
  return result;
}

function getPulserStatus() {
  const collection = db.get().db("quad").collection('pulserStatusOnline');
  const result = collection.find().sort({$natural: -1}).toArray();
  return result;
}

function getSparkInfo(){
  const collection = db.get().db("quad").collection('sparkPattern');
  const result = collection.find().toArray();
  return result;
}

function getLastSpark(nSparks=1){
  const collection = db.get().db("quad").collection('sparkHistory');
  const result = collection.find().sort({$natural: -1}).limit(nSparks).toArray();
  return result;
}

function getSparkThreshold(){
  const collection = db.get().db("quad").collection('sparkThreshold');
  const result = collection.find().sort({$natural: -1}).limit(1).toArray();
  return result;
}

// Get entries from last period * npoints seconds
function getAvgCV(period, npoints){
  const collection = db.get().db("quad").collection('cv');
  // const t0 = new Date(new Date().setDate(new Date().getDate() - 1));
  const t0 = new Date(new Date() - 1000 * period * npoints);
  // httpLog.info(t0);
  const result = collection.aggregate([
    { "$match" : { "timestamp":{ $gt: t0} }},
    { "$project" : { "_id": 0, "level": 0, "message": 0 }},
    { "$group": {
      "_id": { "$toDate": {
        "$subtract": [ { "$toLong": "$timestamp" },
          { "$mod": [{ "$toLong": "$timestamp" }, 1000 * period ]}
        ]
      }},
      "ospv": {"$avg": "$meta.os.pv"},
      "osnv": {"$avg": "$meta.os.nv"},
      "ospc": {"$avg": "$meta.os.pc"},
      "osnc": {"$avg": "$meta.os.nc"},
      "fspv": {"$avg": "$meta.fs.pv"},
      "fsnv": {"$avg": "$meta.fs.nv"},
      "fspc": {"$avg": "$meta.fs.pc"},
      "fsnc": {"$avg": "$meta.fs.nc"},
      "sspv": {"$avg": "$meta.ss.pv"},
      "ssnv": {"$avg": "$meta.ss.nv"},
      "sspc": {"$avg": "$meta.ss.pc"},
      "ssnc": {"$avg": "$meta.ss.nc"}
    }},
    {"$sort": {"_id": -1}}
  ]).limit(npoints);

  return result.toArray();
}

function getSparkHistory(nSparks = 100){
  const collection = db.get().db("quad").collection('sparkHistory');
  const result = collection.aggregate([
    {"$sort": {"_id": -1}},
    {"$limit": nSparks * 100},
    { "$match" : {}},
    { "$project" : { "_id": 0, "level": 0, "message": 0 }},
    { "$group": {
      "_id": { "$toDate": {
        "$subtract": [ { "$toLong": "$timestamp" },
          { "$mod": [{ "$toLong": "$timestamp" }, 1000 * 60 * 2]}
        ]
      }},
      "timestamp": {"$first": "$timestamp"},
      "meta": {"$first": "$meta"}
    }},
  ])
  return result.toArray();
}
module.exports = {
  getPulseMode: getPulseMode,
  getCV: getCV,
  getLastCV: getLastCV,
  getPulserStatus: getPulserStatus,
  getSparkInfo: getSparkInfo,
  getSparkThreshold: getSparkThreshold,
  getLastSpark: getLastSpark,
  getAvgCV: getAvgCV,
  getSparkHistory: getSparkHistory,
}
