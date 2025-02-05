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

    //frontend api calls
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  
};


// Connect to MongoDB
async function connectMongoDB(){
    await mongoose.connect(process.env.MONGO_DB_URI);
}

module.exports = {adminRouter,cors,corsOptions,initializeSocket,authRouter,http,errorMiddleware,connectMongoDB,userRouter}
