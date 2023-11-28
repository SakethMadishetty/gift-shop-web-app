//app.js
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var express = require('express');
var app = express();
var path = require('path');


var PORT = 3000;
app.listen(PORT, function() {
    console.log('Server is running on port ' + PORT);
});

app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'my-secret-key-1',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 1000 }  // Auto logout after 10 seconds
}));

var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost:27017/Arcade');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(session({ secret: 'this-is-a-secret-token' }));
app.use(passport.initialize());
app.use(passport.session());
var indexRouter = require('./routes/index');
app.use('/', indexRouter);

// app.use(function(req, res, next) {
//   next(createError(404));
// });

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

