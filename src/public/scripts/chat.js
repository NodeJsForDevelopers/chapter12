$(document).ready(function() {
    'use strict';
    var socket = io();
    
    $('form.chat').submit(function(event){
        socket.emit('chatMessage', $('#message').val());
        $('#message').val('');
        event.preventDefault();
    });

    socket.on('chatMessage', function(message){
        $('#messages').append($('<p>').text(message));
    });
});
