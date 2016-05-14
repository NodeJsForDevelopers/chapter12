'use strict';

const redisClient = require('../config/redis.js');
const uuid = require('uuid');

const getUser = userId =>
    redisClient.getAsync(`user:${userId}:name`)
        .then(userName => ({
            id: userId,
            name: userName
        }));

const setUsername = (userId, name) =>
    redisClient.setAsync(`user:${userId}:name`, name);

module.exports = {
    getOrCreate: (provider, providerId, providerUsername) => {
        let providerKey = `provider:${provider}:${providerId}:user`;
        let newUserId = uuid.v4();
        return redisClient.setnxAsync(providerKey, newUserId)
            .then(created => {
                if (created) {
                    return setUsername(newUserId, providerUsername)
                        .then(() => getUser(newUserId));
                } else {
                    return redisClient
                        .getAsync(providerKey).then(getUser);
                }
            });
    },
    getUser: getUser,
    getUsername: userId =>
        redisClient.getAsync(`user:${userId}:name`),
    setUsername: setUsername,
    recordWin: userId =>
        redisClient.zincrbyAsync('user:wins', 1, userId),
    getTopPlayers: () =>
        redisClient.zrevrangeAsync('user:wins', 0, 2, 'withscores')
        .then(interleaved => {
            if (interleaved.length === 0) {
                return [];
            }
            let userIds = interleaved
                .filter((user, index) => index % 2 === 0)
                .map((userId) => `user:${userId}:name`);
            return redisClient.mgetAsync(userIds)
                .then(names => names.map((username, index) => ({
                    name: username,
                    userId: interleaved[index * 2],
                    wins: parseInt(interleaved[index * 2 + 1], 10)
                })));
        }),
    getRanking: userId => {
        return Promise.all([
            redisClient.zrevrankAsync('user:wins', userId),
            redisClient.zscoreAsync('user:wins', userId)
        ]).then(out => {
            if (out[0] === null) {
                return null;
            }
            return { rank: out[0] + 1, wins: parseInt(out[1], 10) };
        });
    }
};
