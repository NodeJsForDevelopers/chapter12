'use strict';

describe('chat', function() {
    const expect = require('chai').expect;
    let server, io, url, createUser, createdClients = [];
    
    beforeEach(done => {
        server = require('http').createServer();
        
        server.listen((err) => {
            if (err) {
                done(err);
            } else {
                const addr = server.address();
                url = 'http://localhost:' + addr.port; 

                io = require('socket.io')(server);
                io.use((socket, next) => {
                    socket.request.user = {
                        name: socket.request.headers.username
                    };
                    next();
                });
                require('../../src/realtime/chat.js')(io);
                
                done();
            }
        });
    });
    
    afterEach(done => {
        createdClients.forEach(client => client.disconnect());
        server.close(done);
    });
    
    it('warns unnamed users to choose a username', done => {
        const unnamedUser = createUser();
        unnamedUser.client.emit('chatMessage', 'Hello!');
        unnamedUser.client.on('chatMessage', (data) => {
            expect(data.message).to.contain('choose a username');
            expect(data.username).to.be.undefined;
            expect(data.type).to.equal('warning');
            done();
        });
    });
    
    it('broadcasts arrival of named users', done => {
        const connectedUser = createUser();
        const newUser = createUser('User1');
        connectedUser.client.on('chatMessage', (data) => {
            expect(data.message).to.contain('arrived');
            expect(data.username).to.equal(newUser.name);
            expect(data.type).to.equal('action');
            done();
        });
    });
    
    it('emits messages from named users back to all users', done => {
        const namedUser = createUser('User1');
        const otherUser = createUser();
        const messageReceived = function(data) {
            this.received = data;

            if (namedUser.received && otherUser.received) {

                [namedUser.received, otherUser.received]
                .forEach(received => {
                    expect(received.message).to.equal('Hello!');
                    expect(received.username)
                        .to.equal(namedUser.name);
                });
                done();
            }
        };
        otherUser.client.on('chatMessage',
                            messageReceived.bind(otherUser));
        namedUser.client.on('chatMessage',
                            messageReceived.bind(namedUser));
        namedUser.client.emit('chatMessage', 'Hello!');
    });

    const createClient = require('socket.io-client');
    createUser = (name) => {
        let headers = {};
        if (name) {
            headers.username = name;
        }
        
        let user = {
            name: name,
            client: createClient(url, { extraHeaders: headers})
        };
        createdClients.push(user.client);

        return user;
    };
});
