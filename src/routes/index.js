'use strict';

module.exports = (gamesService, usersService) => {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res, next) {
        Promise.all([
            gamesService.createdBy(req.user.id),
            gamesService.availableTo(req.user.id),
            usersService.getUsername(req.user.id),
            usersService.getRanking(req.user.id),
            usersService.getTopPlayers()
        ])
            .then(results => {
                res.render('index', {
                            title: 'Hangman online',
                            userId: req.user.id,
                            createdGames: results[0],
                            availableGames: results[1],
                            username: results[2],
                            ranking: results[3],
                            topPlayers: results[4],
                            partials: { createdGame: 'createdGame' }
                        });
                })
            .catch(next);
    });

    return router;
};
