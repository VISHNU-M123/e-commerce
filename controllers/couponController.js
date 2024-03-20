const mongoose = require('mongoose');
const Product = require('../models/product')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')




const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.render('coupon', { coupons });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const addCoupon = async (req,res) => {
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message)
    }
}




const generateCouponCode = () => {
    // Generate a random coupon code here (e.g., using Math.random() or a library like uuid)
    // For simplicity, let's say it's a 6-digit alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let couponCode = '';
    for (let i = 0; i < 6; i++) {
        couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return couponCode;
};

const generateCoupon = async (req, res) => {
    try {
        const { couponName, discountAmount, minAmount, couponDescription, expiryDate, status } = req.body;
        
        // Generate random coupon code
        const couponCode = generateCouponCode();

        // Create new coupon instance
        const newCoupon = new Coupon({
            couponName,
            couponCode,
            discountAmount,
            minAmount,
            couponDescription,
            expiryDate,
            status
        });

        // Save the new coupon
        await newCoupon.save();

        res.redirect('/admin/coupon'); // Redirect to coupon page after generating coupon
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



const editCoupon = async (req, res) => {
    try {
        const couponId = req.query.id
        const coupon = await Coupon.findById( {_id:couponId});
        if (!coupon) {
            return res.status(404).send('Coupon not found');
        }
        res.render('editcoupon', { coupon });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



// const updateCoupon = async (req, res) => {
//     try {
//         const { couponName, discountAmount, minAmount, couponDescription, expiryDate, status } = req.body;
//         const couponId = req.params.id; // Retrieve coupon ID from params

//         // Parse minAmount to ensure it's a single number
//         const parsedMinAmount = Array.isArray(minAmount) ? parseFloat(minAmount[0]) : parseFloat(minAmount);

//         // Update coupon details
//         await Coupon.findByIdAndUpdate(couponId, {
//             couponName,
//             discountAmount,
//             minAmount: parsedMinAmount, // Use parsed minAmount value
//             couponDescription,
//             expiryDate,
//             status
//         });

//         res.redirect('/admin/coupon');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// };


const updateCoupon = async (req, res) => {
    try {
        const { couponName, discountAmount, minAmount, couponDescription, expiryDate, status } = req.body;
        const couponId = req.params.id; // Retrieve coupon ID from params

        // Generate a new coupon code
        const newCouponCode = generateCouponCode();

        // Update coupon details and coupon code
        await Coupon.findByIdAndUpdate(couponId, {
            couponName,
            couponCode: newCouponCode, // Update coupon code
            discountAmount,
            minAmount,
            couponDescription,
            expiryDate,
            status
        });

        res.redirect('/admin/coupon'); // Redirect to coupon page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};





const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.redirect('/admin/coupons'); // Redirect to coupon page after deleting a coupon
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getCoupons,
    addCoupon,
    //uploadCoupon,
    generateCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon
}