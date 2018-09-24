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

module.exports = {
  getPulseMode: getPulseMode,
  getCV: getCV,
}
