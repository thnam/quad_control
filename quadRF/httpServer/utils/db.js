const mongoClient = require('mongodb').MongoClient;
const config = require('config');

const dbUrl = `mongodb://${config.get('mongo.host')}:${config.get('mongo.port').toString()}/${config.get('mongo.db')}`;
let mongodb;

function connect(callback){
	console.log(`Connecting to ${dbUrl}...`);
	mongoClient.connect(
		dbUrl,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(err, db) => {
			mongodb = db;
			callback();
		}
	);
    console.log(`Successfully connected to ${dbUrl}.`);
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

