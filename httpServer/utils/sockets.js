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
    const cv = await dbTool.getCV();
    // console.log(cv);
    socket.emit("cv", {cv: cv});

  }, 3000);
});

module.exports = io;
