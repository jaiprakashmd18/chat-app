require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const connectDB          = require('./config/db');
const createApp          = require('./app');
const { initializeSocket } = require('./socket/index');

const app    = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

initializeSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () =>
    console.log(`MeCHAT running on port ${PORT} [${process.env.NODE_ENV}]`)
  );
};

startServer();

module.exports = { app, io };
