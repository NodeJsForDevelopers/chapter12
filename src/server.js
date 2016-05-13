'use strict';

module.exports = require('./config/mongoose').then(mongoose => {
    const app = require('../src/app')(mongoose);
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    
    if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
        const redisAdapter = require('socket.io-redis');
        io.adapter(redisAdapter(process.env.REDIS_URL));
    }
    
    io.use(adapt(require('cookie-parser')()));
    const usersService = require('./services/users.js');
    io.use(adapt(require('./middleware/users')(usersService)));
    
    require('./realtime/chat')(io);
    
    server.on('close', () => { 
        require('../src/config/redis.js').quit();
        mongoose.disconnect();
    });
    return server;
});

function adapt(expressMiddleware) {
    return (socket, next) => {
        expressMiddleware(socket.request, socket.request.res, next);
    };
}
