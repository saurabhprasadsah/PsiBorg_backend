const express = require('express');
const app = express();
const config = require('./config/config');
require('dotenv').config();

// Middlewares and packages required for this application
app.use(config.cors(config.corsOptions));
app.use(express.json());

const server = config.http.createServer(app);

// Initialize Socket.IO connection
config.initializeSocket(server);

// Express Routes
// Authentication Routes (Register, Login, Logout)
app.use('/api/v1/auth', config.authRouter);

// User Routes (Get, Create, Update, Delete, Search)
app.use('/api/v1/users', config.userRouter);

// Admin Routes (Get, Update, Delete, Search)
app.use('/api/v1/admin', config.adminRouter);

// Root Route Behavior Based on Environment
app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "API not found. Use /api/v1/..." });
  }
  res.json({ message: "Welcome to the API! Use /api/v1/... for endpoints." });
});

// Error Handling Middleware
app.use(config.errorMiddleware);

// Start the server
server.listen(process.env.PORT || 5000, async () => {
  await config.connectMongoDB();
  console.log('Connected to MongoDB');
  console.log(`Server is running at http://localhost:${process.env.PORT || 5000}`);
});
