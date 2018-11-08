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

function getSparkThreshold(){
  const collection = db.get().db("quad").collection('sparkThreshold');
  const result = collection.find().sort({$natural: -1}).limit(1).toArray();
  return result;
}

module.exports = {
  getPulseMode: getPulseMode,
  getCV: getCV,
  getLastCV: getLastCV,
  getPulserStatus: getPulserStatus,
  getSparkInfo: getSparkInfo,
  getSparkThreshold: getSparkThreshold,
}
