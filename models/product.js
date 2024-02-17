const mongoose = require('mongoose');
const productData = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        min: 0,
        required: true
    },
    OfferPrice: {
        type: Number,
        min: 0,
        required: true
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories', // Reference to the Category model
        required: true,
    },
    Status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active"
    },
    Quantity: {
        type: Number,
        min: 0,
        required: true
    },
    Images: {
        type: [String],
        required: true
    },
    CroppedImageData: {
        type: {
            x:{type:Number,default:0},
            y:{type:Number,default:0},
            width:{type:Number,default:0},
            height:{type:Number,default:0},
        },
        default:{}
    }
})

const Product = mongoose.model('Product', productData);
module.exports = Product;