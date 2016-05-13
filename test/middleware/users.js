'use strict';

const factory = require('../../src/middleware/users.js');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Users middleware', function() {
    let defaultUserId = 'user-id-1';
    let request, usersService, middleware;
    
    beforeEach(function() {
        request = { cookies: { userId: defaultUserId} };
        usersService = { getUsername: sinon.stub() };
        middleware = factory(usersService);
    });
        
    it('if the user already signed in, reads their ID from a cookie and exposes the user on the request', done => {
        // Given
        const username = 'User Name';
        usersService.getUsername.withArgs(defaultUserId).returns(Promise.resolve(username));
        
        // When
        middleware(request, {}, () => {
            // Then
            expect(request.user).to.exist;
            expect(request.user.id).to.equal(defaultUserId);
            expect(request.user.name).to.equal(username);
            done();
        });
    });
    
    it('calls the next middleware in the chain', done => {
        usersService.getUsername.withArgs(defaultUserId).returns(Promise.resolve());
        
        middleware(request, {}, done);
    });
    
    it('if the user is not already signed in, creates a new user id and stores it in a cookie', done => {
        // Given
        request.cookies.userId = undefined;
        const response = { cookie: sinon.spy() };
        
        // When
        middleware(request, response, () => {
            // Then
            expect(request.user).to.exist;
            const newUserId = request.user.id;
            expect(newUserId).to.exist;
            expect(response.cookie.calledWith('userId', newUserId)).ok;
            done();
        });
    });
});
