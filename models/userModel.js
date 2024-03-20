const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]

});



// Define a method to compare passwords
userData.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};



module.exports = mongoose.model('User', userData)