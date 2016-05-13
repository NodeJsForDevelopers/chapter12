'use strict';

const EventEmitter = require('events');
const emitter = new EventEmitter();

module.exports = (mongoose) => {
    let Game = mongoose.models['Game'];

    if (!Game) {
        const Schema = mongoose.Schema;
        const gameSchema = new Schema({
            word: String,
            setBy: String
        });

        gameSchema.methods.positionsOf = function(character) {
            let positions = [];
            for (let i in this.word) {
                if (this.word[i] === character.toUpperCase()) {
                    positions.push(i);
                }
            }
            return positions;
        };
        
        gameSchema.methods.matches = function(word) {
            return this.word === word.toUpperCase();
        };

        gameSchema.post('save', game =>
            emitter.emit('gameSaved', game));
        gameSchema.post('remove', game =>
            emitter.emit('gameRemoved', game));

        Game = mongoose.model('Game', gameSchema);
    }

    return {
        create: (userId, word) => {
            const game =
                new Game({setBy: userId, word: word.toUpperCase()});
            return game.save();
        },
        createdBy: userId => Game.find({setBy: userId}),
        availableTo: userId => Game.where('setBy').ne(userId),
        get: id => Game.findById(id),
        events: emitter
    };
};

module.exports.events = emitter;
