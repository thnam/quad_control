const mongoClient = require('mongodb').MongoClient;
const config = require('config');
const dbUrl = "mongodb://" + config.get("mongo.user") + ":"
  + config.get("mongo.password") + "@" + config.get("mongo.host") + ":"
  + config.get("mongo.port").toString() +
  "/" + config.get("mongo.db");

let mongodb;

function connect(callback){
  mongoClient.connect(dbUrl, {useNewUrlParser: true}, (err, db) => {
    mongodb = db;
    callback();
  });
}
function get(){
  return mongodb;
}

function close(){
  mongodb.close();
}

module.exports = {
  connect,
  get,
  close
};

