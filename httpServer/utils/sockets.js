// socket io for pushing periodic events
const io = require('socket.io')(require(global.appRoot + "/bin/www"));
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const sparkLog = require(global.appRoot + '/loggers/sparkLogger.js');
const dbTool = require(global.appRoot + "/utils/dbTools.js");
const config = require('config');

io.on('connection', function (socket) {
  httpLog.info("Client connected from: "  + socket.handshake.address);

  socket.on("reloadReq", ()=>{
    httpLog.info("reloadReq received, will broadcast reload to all clients");
    socket.emit("reload");
  });

  socket.emit('greeting', {
    message: "Greeting from quad controller.",
    controller: config.controller
  });

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
      const pulseMode = await dbTool.getPulseMode();
      socket.emit("pulseMode", pulseMode);
    } catch (e) {
      console.error(e);
    }
  }, config.get("logger.pulseModePollingPeriod"));

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
});


module.exports = io;
