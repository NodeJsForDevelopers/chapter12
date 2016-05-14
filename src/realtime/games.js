'use strict';

module.exports = (io, service) => {
    io.of('/games').on('connection', (socket) => {
        forwardEvent('gameSaved', socket);
        forwardEvent('gameRemoved', socket);
    });

    function forwardEvent(name, socket) {
        service.events.on(name, game => {
            if (!socket.request.user ||
                    game.setBy !== socket.request.user.id) {
                socket.emit(name, game.id);
            }
        });
    }
};
