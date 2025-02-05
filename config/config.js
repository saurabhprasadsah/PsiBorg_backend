const mongoose = require('mongoose');
const authRouter =require('../routers/auth-router');
const userRouter = require('../routers/user-router');
const adminRouter=require('../routers/admin-router');
const errorMiddleware=require('../middleware/error-middleware');
const { initializeSocket } = require('../socket/socket');
const cors = require('cors');
const http=require('http')
require('dotenv').config();

const corsOptions = {
    origin: 'http://localhost:3001',  // Frontend URL (React app)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // Allow cookies to be sent with the request
};


// Connect to MongoDB
async function connectMongoDB(){
    await mongoose.connect(process.env.MONGO_DB_URI);
}

module.exports = {adminRouter,cors,corsOptions,initializeSocket,authRouter,http,errorMiddleware,connectMongoDB,userRouter}
