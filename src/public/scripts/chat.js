$(document).ready(function() {
    'use strict';
    var chat = $('form.chat');
    var socket = io('/chat');
    
    socket.emit('joinRoom', chat.data('room'));
    chat.submit(function(event){
        socket.emit('chatMessage', $('#message').val());
        $('#message').val('');
        event.preventDefault();
    });

    socket.on('chatMessage', function(data){
        $('#messages').append(
            $('<p>').text(data.message).addClass(data.type)
                .prepend($('<b>').text(data.username)));
    });
});
