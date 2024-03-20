const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId : {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        }
    }],
    status: {
        type:String,
        enum:['pending','shipped','delivered','cancelled','returned'],
        default:'pending'
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    totalPrice:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true,
        //enum:['Cash on Delivery ','razorpay','Credit Cart','Debit Cart','PayPal','Bank Transfer']   
    },
    cancellationReason: {
        type: String,
       
    }
});

module.exports = mongoose.model('Order', orderSchema);
