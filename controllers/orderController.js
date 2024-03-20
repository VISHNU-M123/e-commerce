const mongoose = require('mongoose');
const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const Product = require('../models/product');
const Wallet = require('../models/walletModel')
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();


const instance = new Razorpay({
    key_id:  process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})



const placeOrder = async (req, res) => {
    try {
        console.log("Place Order route hit"); 
        const userId = req.session.user_id;
        //console.log("User ID:", req.session.user_id);
            
        console.log("req.body is ",req.body);
        console.log("req.body value ",req.body);
        const  paymentMethod  = req.body.value
        console.log('paymentMethod',paymentMethod);
        const totalAmount=req.body.totalAmount
        console.log("totalAmount",totalAmount);


        const cart = await Cart.findOne({ userid: userId }).populate('products.productId');
        console.log("Cart Before Deletion:");

        if (!cart || cart.products.length ===  0) {
            console.log('cart is empty or not found')
            return res.status(400).json({ error: 'Your cart is empty. Please add items to your cart before proceeding to checkout.' });
        }

        let total =  0;
        const products = cart.products.map(item => {
            total += item.totalPrice;
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productPrice
            };
        });
        console.log("Products:", products);
        console.log("Total Price:", total);

        const newOrder = new Order({
            userId: userId,
            products: products,
            totalPrice: total,
            paymentMethod: paymentMethod
        });
        await newOrder.save();
        console.log("New Order:", newOrder);

        if(paymentMethod === "cash on delievry"){
            console.log('processing cash on delivery payment')
            await cart.deleteOne({ userid: userId });
            console.log("Cart Deleted:", cart);
    
            // Check if the cart is indeed deleted
            const deletedCart = await Cart.findOne({ userid: userId });
            console.log("Cart After Deletion:", deletedCart);


             // update product quantity
        for(const item of products){
            const product = await Product.findById(item.productId)
            if(product){
                console.log('product before update',product)
                product.Quantity -= item.quantity
                await product.save()
                console.log("Product After Update:", product); 
            }
        }
    
            res.json({ success: true, message: 'Order placed successfully.' });
            //res.redirect('/profile');
        }else if(paymentMethod === "razorpay"){
            console.log('processing razopay payment')
           await Order.updateOne({_id:newOrder._id},{$set:{status:"success"}})
        
           
        }



        const user = await User.findById(userId);
        //console.log("User Before Update:", user);
        user.orders.push(newOrder._id);
        await user.save();
        console.log("User After Update:");


        await cart.deleteOne({ userid: userId });
        console.log("Cart Deleted:", cart);

        // Check if the cart is indeed deleted
        const deletedCart = await Cart.findOne({ userid: userId });
        console.log("Cart After Deletion:", deletedCart);

        res.json({ success: true, message: 'Order placed successfully.' });
        //res.redirect('/profile');
    } catch (error) {
        console.log("Error:", error.message);

        res.status(500).json({ success: false, error: 'Failed to place order. Please try again later.' });
       // res.status(500).send('Server Error');
    }
};

const createOrder=async(req,res)=>{
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret: process.env.RAZORPAY_SECRET_KEY
        })

        const options = {
            amount: req.body.totalAmount * 100,
            currency: "INR",
        }
        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log('error in create', error);
                return res.status(500).json({ message: "something went wrong" })
            } else {
                console.log('create order success');
                res.status(200).send({
                    success: true,
                    msg: "Order created",
                    orderId: order.id,
                    amount: req.body.totalAmount * 100,
                    key_id: process.env.RAZORPAY_ID_KEY,
                   
                    description: "Test Transaction",

                })

            }
        })
        
    } catch (error) {
        console.log('error in create order', error);
        return res.status(500).json({ message: "internal server error" })
        
    }
}

const verifypayment = async (req, res) => {
    try {

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


        const data = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(data)
            .digest('hex');


        if (generated_signature === razorpay_signature) {


            res.status(200).json({ success: true, message: "Payment is successful", razorpay_payment_id });
        } else {
            console.log("Signature verification failed");
            res.status(400).json({ success: false, message: "Payment verification failed" })
        }
    } catch (error) {
        console.log(error);
    }
}





// const generateRazorpay = (orderId, total) => {
//     return new Promise((resolve, reject) => {
//         const options = {
//             amount: total,
//             currency: "INR",
//             receipt: "" + orderId
//         };

//         console.log('generating razorpay order with options',options)

//         instance.orders.create(options, function (error, order) {
//             if (error) {
//                 console.log('error generating razorpay order',error)
//                 console.log(error);
//                 reject(error);
//             } else {
//                 console.log('razorpay order generated successfully',order)
//                 resolve({ order, orderId:order.id });
//             }
//         });
//     });
// };











// const verifyPayment = async (req,res) => {
//     try {
//         console.log('verify payment route hit')
//         const userid = req.session.user_id;
//         const { payment, order } = req.body;
//         console.log('payment ', payment)
//         console.log('order',order)

//         const Crypto = require("crypto");
//         const orderId = order.order.receipt;

//         // console.log('Response:', response);

//         // console.log("payment:", payment);
//         // console.log("Order:", order);
//         // console.log("orderId",orderId);
//         // console.log("order",order);

//         const secret = process.env.RAZORPAY_SECRET_KEY;
//         let hmac = Crypto.createHmac('sha256', secret);
//         hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
//         hmac = hmac.digest('hex');

//         console.log('HMAC' , hmac)
//         console.log('razorpay signature',payment.razorpay_signature)

//         if (hmac === payment.razorpay_signature) {
//             console.log('payment signature verified')
//             const order = await Order.findById(orderId);
//             if (order) {
//                 order.paymentStatus = "Razorpay";
//                 await order.save();
//                 console.log('order payment status updated to razorpay')
//             }

//             const cart = await Cart.findOne({ userid: userid });
//             if (cart && cart.products && cart.products.length > 0) {
//                 console.log('updating product quantities')
//                 for (let i = 0; i < cart.products.length; i++) {
//                     const productId = cart.products[i].productId;
//                     const count = cart.products[i].quantity;

//                     await Product.updateOne(
//                         { _id: productId },
//                         {
//                             $inc: {
//                                 quantity: -count
//                             }
//                         }
//                     );
//                 }
//             }

//             await Cart.deleteOne({ userid: userid });
//             console.log('cart deleted after payment')
//             res.json({ payment: true });
//         }
//     } catch (error) {
//         console.log('payment signature verification failed')
//         //res.redirect("/500")
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }

// }






const cancelOrder = async (req, res) => {
    console.log('cancel order called');
    try {
        // Retrieve orderId from req.body first
        // const orderId = req.body.orderId;
        const { orderId, cancellationReason } = req.body;
        console.log("Order ID:", orderId); // Log the orderId to ensure it's being received correctly

        // Then correctly create a new ObjectId instance
        const orderIdObjectId = new mongoose.Types.ObjectId(orderId);
        console.log("Order ID ObjectId:", orderIdObjectId); // Log the ObjectId to ensure it's being created correctly

        const userId = req.session.user_id;
        console.log("User ID from session:", userId); // Log the userId to ensure it's being received correctly

        // Find the order by its ID
        const order = await Order.findById(orderId);
        console.log("Order found:", order); // Log the order to ensure it's being found correctly




         // Update the order with the cancellation reason
         order.cancellationReason = cancellationReason;

         // Save the updated order
         await order.save();




        // if (!order) {
        //     return res.status(404).json({ success: false, error: 'Order not found.' });
        // }

        // // Check if the order belongs to the current user
        // if (order.userId.toString() !== userId) {
        //     return res.status(403).json({ success: false, error: 'You do not have permission to cancel this order.' });
        // }




        for(const item of order.products){
            const product = await Product.findById(item.productId)
            if(product){
                product.Quantity += item.quantity
                await product.save()
            }
        }




        order.status = 'cancelled';
        order.cancellationReason = cancellationReason;
        await order.save();
        // Remove the order from the database
        // try {
        //     await order.deleteOne();
        //     console.log("Order deleted:", order); // Log the order to ensure it's being deleted correctly
        // } catch (error) {
        //     console.error("Error deleting order:", error);
        //     return res.status(500).json({ success: false, error: 'An error occurred while deleting the order.' });
        // }

        // Find the user and remove the order ID from their orders array
        // try {
        //     const user = await User.findById(userId);
        //     console.log("User found:", user); // Log the user to ensure it's being found correctly

        //     console.log("Before update:", user.orders); // Log the user's orders before update
        //     // Corrected comparison using string comparison
        //     user.orders = user.orders.filter(id => id !== orderId);
        //     console.log("After update:", user.orders); // Log the user's orders after update

        //     await user.save();
        //     console.log("User saved:", user); // Log the user to ensure it's being saved correctly
        // } catch (error) {
        //     console.error("Error updating user:", error);
        //     return res.status(500).json({ success: false, error: 'An error occurred while updating the user.' });
        // }

        // Send a response with a 'success' property set to true
        res.json({ success: true, message: 'Order canceled successfully.' });
    } catch (error) {
        console.error("Error in cancelOrder:", error);
        res.status(500).json({ success: false, error: 'An error occurred while canceling the order.' });
    }
}




const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Check if the order exists
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update the order status to "returned" or any status you prefer
        order.status = 'returned';
        await order.save();



        //add the total price to the user's wallet
        const user = await User.findById(order.userId)
        const wallet = await Wallet.findOne({userId:order.userId})

        if(!user || !wallet){
            return res.status(404).json({success:false,message:'User or wallet not found'})
        }
        await wallet.updateBalance(order.totalPrice)

        // You can perform additional logic here, like updating inventory, etc.

        return res.status(200).json({ success: true, message: 'Order returned successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to return order. Please try again later.' });
    }
};


module.exports = {                                                                                                                                                                                                                                                    
    placeOrder,
    verifypayment,
    cancelOrder,
    createOrder,
    returnOrder
}