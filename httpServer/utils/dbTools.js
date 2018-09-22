const mongoClient = require('mongodb').MongoClient;
var config = require('config');
var url = "mongodb://" + config.get("mongo.user") + ":"
  + config.get("mongo.password") + "@" + config.get("mongo.host") + ":"
  + config.get("mongo.port").toString() +
  "/" + config.get("mongo.db");

function getPulseMode() {
  return mongoClient.connect(url, {useNewUrlParser: true}).then(function(db) {
    var collection = db.db("quad").collection('pulseMode');
    return collection.findOne();
  }).then(function(items) {
    return items;
  });
}

function getLastCV() {
  return mongoClient.connect(url, {useNewUrlParser: true})
    .then(function(db) {
      const collection = db.db("quad").collection('cvOnline');
      const result = collection.find().sort({$natural: -1}).limit(1).toArray();
      return result;
    })
    .then(function(item) {
      return item;
    });
}

function getOnlineCV() {
  return mongoClient.connect(url, {useNewUrlParser: true})
    .then(function(db) {
      const collection = db.db("quad").collection('cvOnline');
      const result = collection.find().sort({$natural: -1}).toArray();
      return result;
    })
    .then(function(items) {
      return items;
    });
}

module.exports = {
  getPulseMode: getPulseMode,
  getLastCV: getLastCV,
  getOnlineCV: getOnlineCV
}
