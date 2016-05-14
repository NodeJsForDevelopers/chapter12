'use strict';

const session = require('express-session');

let config = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
};

if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
    const RedisStore = require('connect-redis')(session);
    config.store = new RedisStore({ url: process.env.REDIS_URL });
}

module.exports = session(config);
