import { config } from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";

config({ path: "../.env" });

import { Server } from "socket.io";

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('Realtime Audio + Whiteboard signaling server'));


const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined ${roomId}`);
        socket.to(roomId).emit('peer-joined', { socketId: socket.id });
    });

    socket.on('signal', ({ roomId, to, data }) => {
        if (to) {
            io.to(to).emit('signal', { from: socket.id, data });
        } else {
            socket.to(roomId).emit('signal', { from: socket.id, data });
        }
    });

    socket.on('draw', ({ roomId, data }) => {
        socket.to(roomId).emit('draw', data);
    });

    socket.on('clear-board', (roomId) => {
        socket.to(roomId).emit('clear-board');
    });

    socket.on('disconnect', () => {
        console.log('socket disconnected:', socket.id);
        // Optionally: notify rooms about leave
        // Note: we don't track which rooms the socket was in here—Socket.IO offers socket.rooms but includes the socket id
    });
});


const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));