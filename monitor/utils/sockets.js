// socket io for pushing periodic events
const io = require('socket.io')(require(global.appRoot + "/bin/www"));
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const sparkLog = require(global.appRoot + '/loggers/sparkLogger.js');
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const config = require('config');

io.on('connection', function (socket) {
  httpLog.info("Client connected from: "  + socket.handshake.address);

  socket.emit('greeting', { message: "Greeting from quad controller." });

  setInterval(()=>{
    const date = new Date();
    const dateStr = date.toDateString() + " - " + date.toLocaleTimeString();
    socket.emit('timeStamp', {timeStamp: dateStr});
  }, 1000);

  // socket.on('join', function (data) {
    // httpLog.info("Join");
  // });
  
  setInterval(async ()=>{
    try {
      const cv = await dbTool.getCV();
      socket.emit("cv", {cv: cv});

    } catch (e) {
      console.error(e);
    }
  }, config.get("logger.voltagePollingPeriod"));

  setInterval(async ()=>{
    try {
      const pulserStatus = await dbTool.getPulserStatus();
      socket.emit("pulserStatus", {pulserStatus: pulserStatus});
    } catch (e) {
      console.error(e);
    }
  }, config.get("logger.pulserStatePollingPeriod"));

  setInterval(async ()=>{
    try {
      const sparkEntry = await dbTool.getSparkInfo();
      const sparkInfo = sparkEntry[0].meta;
      // simply add all channels to give a global spark indicator
      let nSparks = 0;
      for (let q in sparkInfo) {
        if (q.length == 2) { // choose only q*
          for (let l in sparkInfo[q]) { // s, l
            for (var p in sparkInfo[q][l]) { // i, o, t, b
              nSparks += (sparkInfo[q][l][p]);
            }
          }
        }
      }
      socket.emit("sparkPattern", sparkEntry);

      // push the message if needed
      if (nSparks > 0) {
        socket.emit("sparked", sparkEntry);
        sparkLog.info({message: " ", meta: sparkInfo});
      }
    } catch (e) {
      console.error(e);
    }
  }, config.get("logger.sparkPollingPeriod"));

  // emit average values every 1 minutes
  setInterval(async ()=>{
    try {
      // avg over 20 sec, 2 hours worth
      const shortAvgCV = await dbTool.getAvgCV(20, 3 * 60 * 2);
      socket.emit("shortAvgCV", {cv: shortAvgCV});
    } catch (e) {
      console.error(e);
    }
  }, 1000 * 61);

  // emit long term average values every 3 minutes
  setInterval(async ()=>{
    try {
      // avg over 60 sec, 2 day worth
      const longAvgCV = await dbTool.getAvgCV(60, 1 * 60 * 24 * 2);
      socket.emit("longAvgCV", {cv: longAvgCV});
    } catch (e) {
      console.error(e);
    }
  }, 1000 * 191);
});

module.exports = io;
