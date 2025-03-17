const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// API路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 所有其他路由都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

let userCount = 0;

io.on('connection', (socket) => {
  userCount++;
  io.emit('user count', userCount);

  socket.on('chat message', (msg) => {
    const broadcastMsg = {
      ...msg,
      isOwn: false
    };
    socket.broadcast.emit('chat message', broadcastMsg);
  });

  socket.on('disconnect', () => {
    userCount--;
    io.emit('user count', userCount);
  });
});

const PORT = 3001;
http.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});