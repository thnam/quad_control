const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const httpLog = require('./loggers/httpLogger');
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('short', { stream: httpLog.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Catch 404 and forward to error handler
app.use(function(req, res, next){
	next(createError(404));
});

// Error handler
app.use(function(err, req, res, next){
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    httpLog.error(err);

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
