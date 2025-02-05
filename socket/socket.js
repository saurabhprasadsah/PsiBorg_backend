const { Server } = require('socket.io');

// Store messages with a unique ID
const messages = new Map();

// Generate unique IDs for messages
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Initialize and set up Socket.IO
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // Update this for production
      methods: ['GET', 'POST','PUT', 'DELETE','PATCH'],
    },
  });

  // Handle socket connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Broadcast a message to everyone
    socket.on('broadcastMessage', (message) => {
      const messageId = generateUniqueId();
      const msgData = { id: messageId, sender: socket.id, content: message, isPrivate: false };
      messages.set(messageId, msgData);
      io.emit('message', msgData);
    });

    // Send a private message
    socket.on('privateMessage', ({ recipientId, message }) => {
      const messageId = generateUniqueId();
      const msgData = { id: messageId, sender: socket.id, content: message, isPrivate: true, recipientId };
      messages.set(messageId, msgData);
      socket.to(recipientId).emit('message', msgData);
    });

    // Edit a message
    socket.on('editMessage', ({ messageId, newContent }) => {
      const msgData = messages.get(messageId);
      if (msgData && msgData.sender === socket.id) {
        msgData.content = newContent;
        messages.set(messageId, msgData);
        io.emit('messageEdited', msgData);
      }
    });

    // Delete a message
    socket.on('deleteMessage', (messageId) => {
      const msgData = messages.get(messageId);
      if (msgData && msgData.sender === socket.id) {
        messages.delete(messageId);
        io.emit('messageDeleted', messageId);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { initializeSocket };
