'use strict';

module.exports = io => {
    io.on('connection', (socket) => {
        const username = socket.request.user.name;

        if(username) {
            socket.broadcast.emit('chatMessage', {
                username: username,
                message: 'has arrived',
                type: 'action'
            });
        }
        
        socket.on('chatMessage', (message) => {
            if (!username) {
                socket.emit('chatMessage', {
                    message: 'Please choose a username',
                    type: 'warning'
                });
            } else {
                io.emit('chatMessage', {
                    username: username,
                    message: message
                });
            }
        });
    });
 };
