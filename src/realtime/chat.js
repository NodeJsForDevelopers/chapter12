'use strict';

module.exports = io => {
    io.on('connection', (socket) => {
       socket.on('chatMessage', (message) => {
           io.emit('chatMessage', {
                username: socket.request.user.name,
                message: message
            });
        });
    });
 };
