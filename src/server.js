'use strict';

module.exports = require('./config/mongoose').then(mongoose => {
    const app = require('../src/app')(mongoose);
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    require('./realtime/chat')(io);
    
    server.on('close', () => { 
        require('../src/config/redis.js').quit();
        mongoose.disconnect();
    });
    return server;
});
