const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const httpLog = require(global.appRoot + '/loggers/httpLogger.js');
// const log = require(global.appRoot + '/loggers/pulseModeLogger.js');
// log.info("Stop");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('tiny', {stream: httpLog.stream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require(global.appRoot + "/routes/index"));
app.use('/pulsemode', require(global.appRoot + '/routes/pulseMode'));
app.use('/setpulsemode', require(global.appRoot + '/routes/setPulseMode'));
app.use('/compute', require(global.appRoot + '/routes/compute'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  httpLog.error(err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
