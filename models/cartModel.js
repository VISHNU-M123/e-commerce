// const mongoose = require("mongoose");

// const cartSchema = mongoose.Schema({
//     userid: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'users',
//         required: true
//     },
//     product: [
//         {
//             productid: {
//                 type: mongoose.Schema.ObjectId,
//                 ref: 'Product',
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 default: 1
//             },
//             totalPrice: {
//                 type: Number,
//                 required: true
//             },
//             image: {
//                 type:String,
                
//             }
//         }
//     ],

//     grandTotal: {
//         type: Number,
//         default: 0
//     }
// })

// module.exports = mongoose.model('Cart', cartSchema);







const mongoose = require('mongoose')

const cart = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                default:1
            },
            productPrice:{
                type:Number,
                required:true
            },
            totalPrice:{
                type:Number,
                default:0
            },
            image:{
                type:[String]
            }
        }   
    ],
    grandTotal: {
        type: Number,
        default: 0
    }
})




const Cart = mongoose.model('Cart',cart)
module.exports = Cart