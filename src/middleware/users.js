'use strict';

module.exports = (service) => {
    const uuid = require('uuid');

    return function(req, res, next) {
        let userId = req.session.userId;
        if (!userId) {
            userId = uuid.v4();
            req.session.userId = userId;
            req.user = {
                id: userId
            };
            next();
        } else {
            service.getUsername(userId).then(username => {
                req.user = {
                    id: userId,
                    name: username
                };
                next();
            });
        }
    };
};
