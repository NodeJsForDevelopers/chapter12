$(document).ready(function() {
    'use strict';
    var socket = io('/chat');
    
    $('form.chat').submit(function(event){
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
