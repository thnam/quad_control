const db = require(global.appRoot + "/utils/db");

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

function getSparkHistory(nSparks = 100){
  const collection = db.get().db("quad").collection('sparkHistory');
  const result = collection.aggregate([
    {"$sort": {"_id": -1}},
    {"$limit": nSparks * 30},
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

function getSparkThreshold(){
  const collection = db.get().db("quad").collection('sparkThreshold');
  const result = collection.find().sort({$natural: -1}).limit(1).toArray();
  return result;
}

function getGlobalInhibit() {
  const col = db.get().db("quad").collection("globalInhibit");
  return col.findOne();
}

module.exports = {
  getPulseMode: getPulseMode,
  getCV: getCV,
  getLastCV: getLastCV,
  getPulserStatus: getPulserStatus,
  getSparkInfo: getSparkInfo,
  getSparkThreshold: getSparkThreshold,
  getLastSpark: getLastSpark,
  getSparkHistory: getSparkHistory,
  getGlobalInhibit: getGlobalInhibit,
}
