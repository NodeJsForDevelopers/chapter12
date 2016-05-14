'use strict';

module.exports = io => {
    const namespace = io.of('/chat');
    
    namespace.on('connection', (socket) => {
        const username = socket.request.user.name;
        
        socket.on('joinRoom', (room) => {
            socket.join(room);

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
                    namespace.to(room).emit('chatMessage', {
                        username: username,
                        message: message
                    });
                }
            });
            
            socket.on('disconnect', () => {
                if (username) {
                    socket.broadcast.to(room).emit('chatMessage', {
                        username: username,
                        message: 'has left',
                        type: 'action'
                    });
                }
            });
        });
    });
 };
