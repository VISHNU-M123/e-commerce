const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true
    },
    couponCode: {
        type: String,
        required: true,
        unique: true // Ensure coupon codes are unique
    },
    discountAmount: {
        type: Number,
        default: 0 // Set a default value if needed
    },
    minAmount: {
        type: Number,
        required: true
    },
    couponDescription: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    },
    userUsed: [{
        userid: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        used: {
            type: Boolean,
            default: false
        }
    }]
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;