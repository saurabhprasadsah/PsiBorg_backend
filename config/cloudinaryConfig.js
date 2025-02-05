require('dotenv').config();//Load Environment Variables
const {CloudinaryStorage}= require('multer-storage-cloudinary');
const cloudinary=require('cloudinary').v2;

const cloudinaryConfig={
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}

cloudinary.config(cloudinaryConfig);

const storage= new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'my_chat_app',
        allowed_formats:['png','jpeg','jpg'],
        public_id: (req, file) => `mid_${Date.now()}`,
    },
})

module.exports={cloudinary,storage};