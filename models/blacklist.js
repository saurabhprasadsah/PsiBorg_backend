const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistSchema = new Schema({
    token: [{
        type: String,
        required: true,
    }], 
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // Expires after 1 hour (3600 seconds)
    },
}, { timestamps: true });

module.exports = mongoose.model('Blacklist', blacklistSchema);
