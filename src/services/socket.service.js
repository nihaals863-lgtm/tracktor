import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust this in production
            methods: ["GET", "POST"]
        }
    });

    console.log('Socket.io initialized');

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitLocationUpdate = (data) => {
    if (io) {
        io.emit('location_update', data);
        console.log(`Emitted location_update for operator ${data.operator_id}`);
    }
};
