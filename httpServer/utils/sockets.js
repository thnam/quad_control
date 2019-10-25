// socket io for pushing periodic events
const io = require('socket.io')(require(global.appRoot + "/bin/www"));
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
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
      const spark = await dbTool.getSparkInfo();
      socket.emit("sparkPattern", spark);
    } catch (e) {
      console.error(e);
    }
  }, config.get("logger.sparkPollingPeriod"));
});

module.exports = io;
