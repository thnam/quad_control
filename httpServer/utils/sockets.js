// socket io for pushing periodic events
const io = require('socket.io')(require(global.appRoot + "/bin/www"));
const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
const dbTool = require(global.appRoot + "/utils/dbTools.js");

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
      // console.log(cv);
      socket.emit("cv", {cv: cv});
    } catch (e) {
      next(e);
    }
  }, 3333);

  setInterval(async ()=>{
    try {
      const pulserStatus = await dbTool.getPulserStatus();
      // console.log(cv);
      socket.emit("pulserStatus", {pulserStatus: pulserStatus});
    } catch (e) {
      next(e);
    }
  }, 5000);
});

module.exports = io;
