'use strict';

module.exports = (mongoose) => {
    var express = require('express');
    var path = require('path');
    var logger = require('morgan');
    var bodyParser = require('body-parser');
    
    let sessions = require('./middleware/sessions');
    let gamesService = require('./services/games')(mongoose);
    let usersService = require('./services/users');
    let users = require('./middleware/users')(usersService);
    let routes = require('./routes/index')(gamesService, usersService);
    let games = require('./routes/games')(gamesService, usersService);
    let profile = require('./routes/profile')(usersService);

    var app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hjs');

    // uncomment after placing your favicon in /public
    if (app.get('env') === 'development') {
        app.use(logger('dev'));
    }
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(sessions);
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(users);
    app.use('/', routes);
    app.use('/games', games);
    app.use('/profile', profile);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });

    return app;
};
