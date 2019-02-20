var cvOptions = {
  file:{
    daily: true,
    name: "cv",
    outputName: "Voltages"
  },
  console:{
    enable: true
  },
  db: {
    name: "cv",
    enable: true
  },
  dbOnline: {
    enable: true,
    name: "cvOnline",
    nPoints: require("config").logger.onlineDataPoints
  }
};

const cvLog = require(global.appRoot + "/loggers/baseLogger.js")(cvOptions);

// a hack for sql stuff
const config = require('config');
const knex = require("knex");
// const knexfile = require('knexfile');

var klient = knex({ client: "mysql", 
  connection: config.get("sqlConnection")});

cvLog.on("data", (data) =>{
  console.log("sql: ", data.meta);
  const vc = data.meta;
  klient.table("voltages").insert({
    time: new Date(),
    ospv: vc.os.pv, 
    osnv: vc.os.nv, 
    ospc: vc.os.pc, 
    osnc: vc.os.nc, 
    sspv: vc.ss.pv, 
    ssnv: vc.ss.nv, 
    sspc: vc.ss.pc, 
    ssnc: vc.ss.nc, 
    fspv: vc.fs.pv, 
    fsnv: vc.fs.nv, 
    fspc: vc.fs.pc, 
    fsnc: vc.fs.nc,
    spark: vc.spark
  })
    .then(()=>{
    console.log("inserted")});
});

module.exports = cvLog;
