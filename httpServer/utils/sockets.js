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
      socket.emit("cv", {cv: cv});

      const lastCV = JSON.parse(cv[0].message);
      if (lastCV.spark >= 2) {

        // console.log("spark");
      }
      // else
        // console.log("no spark");

    } catch (e) {
      console.error(e);
    }
  }, 3333);

  setInterval(async ()=>{
    try {
      const pulserStatus = await dbTool.getPulserStatus();
      socket.emit("pulserStatus", {pulserStatus: pulserStatus});
    } catch (e) {
      console.error(e);
    }
  }, 5000);

  setInterval(async ()=>{
    try {
      const spark = await dbTool.getSparkInfo();
      socket.emit("sparkPattern", spark);
    } catch (e) {
      console.error(e);
    }
  }, 10000);
});

module.exports = io;
