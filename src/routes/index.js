'use strict';

module.exports = (gamesService, usersService) => {
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res, next) {
        let userId = null;
        if (req.user) {
            userId = req.user.id;
        }
        
        Promise.all([gamesService.createdBy(userId),
                    gamesService.availableTo(userId),
                    usersService.getUsername(userId),
                    usersService.getRanking(userId),
                    usersService.getTopPlayers()])
            .then(results => {
                res.render('index', {
                            title: 'Hangman online',
                            loggedIn: req.isAuthenticated(),
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
