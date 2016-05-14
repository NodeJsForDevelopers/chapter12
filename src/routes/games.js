'use strict';

module.exports = (gamesService, usersService) => {
    const express = require('express');
    const router = express.Router();

    router.post('/', function(req, res, next) {
        const word = req.body.word;
        if (word && /^[A-Za-z]{3,}$/.test(word)) {
            gamesService.create(req.user.id, word)
                .then(game => res.redirect(`/games/${game.id}/created`))
                .catch(next);
        } else {
            res.status(400).send('Word must be at least three characters long and contain only letters');
        }
    });

    const checkGameExists = function(id, res, onSuccess, onError) {
        gamesService.get(id)
            .then(game => {
                if (game) {
                    onSuccess(game);
                } else {
                    res.status(404).send('Non-existent game ID');
                }
            })
            .catch(onError);
    };

    router.get('/:id', function(req, res, next) {
        checkGameExists(
            req.params.id,
            res,
            game => res.render('game', {
                length: game.word.length,
                id: game.id
            }),
            next);
    });

    router.post('/:id/guesses', function(req, res, next) {
        checkGameExists(
            req.params.id,
            res,
            game => {
                if (req.user && game.matches(req.body.word)) {
                    usersService.recordWin(req.user.id);
                }
                res.send({
                    positions: game.positionsOf(req.body.letter)
                });
            },
            next
        );
    });

    router.delete('/:id', function(req, res, next) {
        checkGameExists(
            req.params.id,
            res,
            game => {
                if (game.setBy === req.user.id) {
                    game.remove()
                        .then(() => res.send())
                        .catch(next);
                } else {
                    res.status(403).send(
                        'You do not have permission to delete this game'
                    );
                }
            },
            next
        );
    });

    router.get('/:id/created', function(req, res, next) {
        checkGameExists(
            req.params.id,
            res,
            game => res.render('createdGame', game));
    });

    return router;
};