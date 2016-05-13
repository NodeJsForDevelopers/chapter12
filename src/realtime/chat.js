'use strict';

module.exports = io => {
    const namespace = io.of('/chat');
    
    namespace.on('connection', (socket) => {
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
                namespace.emit('chatMessage', {
                    username: username,
                    message: message
                });
            }
        });
    });
 };
