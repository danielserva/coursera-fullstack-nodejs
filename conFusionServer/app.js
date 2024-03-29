var createError  = require('http-errors');
var express      = require('express');
var path         = require('path');
var logger       = require('morgan');
var session      = require('express-session');
var FileStore    = require('session-file-store')(session);
var passport     = require('passport');
var authenticate = require('./authenticate');
const mongoose   = require('mongoose');
var config       = require('./config');
var indexRouter    = require('./routes/index');
var usersRouter    = require('./routes/users');
const dishRouter   = require('./routes/dishRouter');
const promoRouter  = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');
const commentRouter  = require('./routes/commentRouter');

const url     = config.mongoUrl;
const connect = mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true } );
connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    //redirecting all non secure requests to https
    res.redirect(307,'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
}) 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use('/dishes', dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageUpload',uploadRouter);
app.use('/favorites', favoriteRouter);
app.use('/comments', commentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
