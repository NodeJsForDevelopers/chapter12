$(function() {
    'use strict';
    
    $('#createGame').submit(function(event) {
        $.post($(this).attr('action'), { word: $('#word').val() },
            function(result) {
                $('#createdGames').append(result);
            });
        event.preventDefault();
    });

    $('#createdGames').on('click', '.delete', function() {
        var $this = $(this);
        $.ajax($this.attr('href'), {
            method: 'delete'
        }).done(function() {
            $this.closest('.game').remove();
        });
        event.preventDefault();
    });
    
    var socket = io('/games');
    var availableGames = $('#availableGames');
    
    socket.on('gameSaved', function(game) {
        availableGames.append('<li id="' + game + '"><a href="/games/' + game + '">' + game + '</a></li>');
    });
    socket.on('gameRemoved', function(game) {
        $('#' + game).remove();
    });
});
