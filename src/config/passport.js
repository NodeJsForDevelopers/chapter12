'use strict';

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = (usersService) => {
    const providerCallback = providerName =>
    function(req, token, tokenSecret, profile, done) {
        usersService.getOrCreate(providerName, profile.id,
                profile.username || profile.displayName)
            .then(user => done(null, user), done);
    };
    
    if(process.env.TWITTER_API_KEY &&
            process.env.TWITTER_API_SECRET) {
        passport.use(new TwitterStrategy({
            consumerKey: process.env.TWITTER_API_KEY,
            consumerSecret: process.env.TWITTER_API_SECRET,
            callbackURL: '/auth/twitter/callback',
            passReqToCallback: true
        }, providerCallback('twitter')));
    }
    
    if(process.env.FACEBOOK_APP_ID &&
            process.env.FACEBOOK_APP_SECRET) {
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: '/auth/facebook/callback',
            passReqToCallback: true
        }, providerCallback('facebook')));
    }
    
    if (process.env.NODE_ENV === 'test') {
        const LocalStrategy = require('passport-local');
        const uuid = require('uuid');
        passport.use(new LocalStrategy((username, password, done) => {
                const userId = uuid.v4();
                usersService.setUsername(userId, username)
                    .then(() => {
                        done(null, { id: userId, name: username });
                    });
                }
        ));
    }

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        usersService.getUser(id)
            .then(user => done(null, user))
            .catch(done);
    });

    return passport;
};
