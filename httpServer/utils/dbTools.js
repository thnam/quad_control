const mongoClient = require('mongodb').MongoClient;
var config = require('config');
var url = "mongodb://" + config.get("mongo.user") + ":"
  + config.get("mongo.password") + "@" + config.get("mongo.host") + ":"
  + config.get("mongo.port").toString() +
  "/" + config.get("mongo.db");

function getPulseMode() {
  return mongoClient.connect(url).then(function(db) {
    var collection = db.db("quad").collection('pulseMode');
    return collection.findOne();
  }).then(function(items) {
    return items;
  });
}

function readOnlineCV() {
  return mongoClient.connect(url).then(function(db) {
    var collection = db.db("quad").collection('cvOnline');

    return collection.find().toArray();
  }).then(function(items) {
    return items;
  });
}
module.exports = {
  getPulseMode: getPulseMode,
  readOnlineCV: readOnlineCV,
}
