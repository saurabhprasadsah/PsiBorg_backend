const { Server } = require('socket.io');

// Store messages with a unique ID
const messages = new Map();

// Generate unique IDs for messages
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Middleware to authenticate users before connecting
function authenticateUser(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: Token required"));
  }

  try {
    // Dummy authentication - Replace with actual JWT verification
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decoded = { userId: socket.id }; // Replace with real authentication

    socket.user = decoded; // Attach user data to socket
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
}

// Initialize and set up Socket.IO
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS || '*', // Restrict in production
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  // Apply authentication middleware
  io.use(authenticateUser);

  // Handle socket connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.userId}`);

    // Rate limiting to prevent spam
    const messageRateLimit = new Map();

    // Helper function to enforce rate limits
    function canSendMessage(userId) {
      const now = Date.now();
      const lastMessageTime = messageRateLimit.get(userId) || 0;
      if (now - lastMessageTime < 1000) { // 1-second limit
        return false;
      }
      messageRateLimit.set(userId, now);
      return true;
    }

    // Broadcast a message to everyone
    socket.on('broadcastMessage', (message) => {
      if (!message || typeof message !== 'string' || message.trim() === "") {
        return socket.emit('error', { error: "Message cannot be empty" });
      }
      if (!canSendMessage(socket.user.userId)) {
        return socket.emit('error', { error: "Rate limit exceeded. Please wait." });
      }

      const messageId = generateUniqueId();
      const msgData = { id: messageId, sender: socket.user.userId, content: message, isPrivate: false };
      messages.set(messageId, msgData);
      io.emit('message', msgData);
    });

    // Send a private message
    socket.on('privateMessage', ({ recipientId, message }) => {
      if (!recipientId || !message) {
        return socket.emit('error', { error: "Recipient and message are required" });
      }
      if (!canSendMessage(socket.user.userId)) {
        return socket.emit('error', { error: "Rate limit exceeded. Please wait." });
      }

      const messageId = generateUniqueId();
      const msgData = { id: messageId, sender: socket.user.userId, content: message, isPrivate: true, recipientId };
      messages.set(messageId, msgData);
      socket.to(recipientId).emit('message', msgData);
    });

    // Edit a message
    socket.on('editMessage', ({ messageId, newContent }) => {
      const msgData = messages.get(messageId);
      if (!msgData) {
        return socket.emit('error', { error: "Message not found" });
      }
      if (msgData.sender !== socket.user.userId) {
        return socket.emit('error', { error: "You can only edit your own messages" });
      }
      if (!newContent || typeof newContent !== 'string' || newContent.trim() === "") {
        return socket.emit('error', { error: "Message content cannot be empty" });
      }

      msgData.content = newContent;
      messages.set(messageId, msgData);
      io.emit('messageEdited', msgData);
    });

    // Delete a message
    socket.on('deleteMessage', (messageId) => {
      const msgData = messages.get(messageId);
      if (!msgData) {
        return socket.emit('error', { error: "Message not found" });
      }
      if (msgData.sender !== socket.user.userId) {
        return socket.emit('error', { error: "You can only delete your own messages" });
      }

      messages.delete(messageId);
      io.emit('messageDeleted', messageId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.userId}`);
      messageRateLimit.delete(socket.user.userId); // Cleanup rate limit tracking
    });
  });

  return io;
}

module.exports = { initializeSocket };
