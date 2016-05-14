'use strict';

const expect = require('chai').expect;
const service = require('../../src/services/users.js');

describe('User service', function() {
    describe('getUsername', function() { 
        it('should return a previously set username', done => {
            const userId = 'user-id-1';
            const name = 'User Name';
            service.setUsername(userId, name)
                .then(() => service.getUsername(userId))
                .then(actual => expect(actual).to.equal(name))
                .then(() => done(), done);
        });
        
        it('should return null if no username is set', done => {
            const userId = 'user-id-2';
            
            service.getUsername(userId)
                .then(name => expect(name).to.be.null)
                .then(() => done(), done);
        });
    });
    
    describe('getOrCreate', () => {
        let provider = 'twitter', providerId, providerUsername = 'twitteruser';
        
        beforeEach(() => {
            providerId = new Date().getTime();
        });
        
        it('creates a new user for the external account if one does not exist', done => {
            service.getOrCreate(provider, providerId, providerUsername)
                .then(createdUser => {
                    expect(createdUser.id).to.exist;
                    expect(createdUser.name).to.equal(providerUsername);
                })
                .then(() => done(), done);
        });
        
        it('returns a user already associated with the external account', done => {
            service.getOrCreate(provider, providerId, providerUsername)
                .then(createdUser => 
                    service.getOrCreate(provider, providerId, 'renamedtwitteruser')
                        .then(retrievedUser => {
                            expect(retrievedUser).to.eql(createdUser);
                        }))
                .then(() => done(), done);
        });
    });
    
    describe('rankings', function() {
        let users = [
            { userId: 'user1', name: 'One' },
            { userId: 'user2', name: 'Two' },
            { userId: 'user3', name: 'Three' },
            { userId: 'user4', name: 'Four' },
            { userId: 'user5', name: 'Five' }
        ];
            
        before(function(done) {
            let setup = [];
            for (let i = 0; i < users.length; ++i) {
                setup.push(service.setUsername(users[i].userId, users[i].name));
                for (let j = 0; j <= i; ++j) {
                    setup.push(service.recordWin(users[i].userId));
                }
            }
            
            Promise.all(setup).then(() => done(), done);
        });
        
        it('should provide the top scoring players along with number of wins', function(done) {
            service.getTopPlayers()
                .then(topPlayers => {
                    expect(topPlayers[0]).to.eql({ userId: 'user5', name: 'Five', wins: 5});
                    expect(topPlayers[1]).to.eql({ userId: 'user4', name: 'Four', wins: 4});
                    expect(topPlayers[2]).to.eql({ userId: 'user3', name: 'Three', wins: 3});
                })
                .then(() => done(), done);
        });
        
        it('should provide the rank and score for a player with wins', function(done) {
            service.getRanking('user4')
                .then(result => {
                    expect(result.rank).to.equal(2);
                    expect(result.wins).to.equal(4);
                })
                .then(() => done(), done);
        });
        
        it('should provide the rank and score for a player with no wins', function(done) {
            service.getRanking('other')
                .then(result => {
                    expect(result).to.be.null;
                })
                .then(() => done(), done);
        });
    });
});
