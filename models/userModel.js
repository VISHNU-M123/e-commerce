const mongoose = require('mongoose');
const userData = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    Status: {
        type: String,
        enum: ["active", "blocked"],
        default: 'active'
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: ''
    },

});

module.exports = mongoose.model('User', userData)