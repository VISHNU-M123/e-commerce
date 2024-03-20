const mongoose = require('mongoose')
const Wishlist = require('../models/wishlistModel')
const User = require('../models/userModel')
const Product = require('../models/product')





const wishlist = async (req,res) => {
    try {
        const userId = req.session.user_id
        
        // fetch the wishlist data from your database
        const wishlistData = await Wishlist.findOne({ userid: userId}).populate('products');

        console.log('wishlist is ',wishlistData)
        res.render('wishlist',{wishlist:wishlistData})
    } catch (error) {
        console.log(error.message)
    }
}





const addToWishlist = async (req,res) => {
    try {
        // const {userId , productId} = req.body
        const userId = req.session.user_id
        const productId = req.params.productId

        //check the user and product exists
        const user = await User.findById(userId)
        console.log('userId',userId)
        const product = await Product.findById(productId)
        console.log('productId',productId)

        if(!user || !product){
            return res.status(404).json({message:'User or product not found'})
        }
        
        const wishlist = await Wishlist.findOne({userid:userId}).populate('products')

        //check if the product is already in the wishlist 
        const isProductInWishlist = wishlist && wishlist.products.some(product => product.equals(productId))
        if(isProductInWishlist){
            return res.status(200).json({message:'Product already in the wishlist'})

        }
        if(!wishlist){
            const newWishlist = new Wishlist({
                userid:userId,
                products:[productId]
            })
            await newWishlist.save()
        }else{
            wishlist.products.push(productId)
            await wishlist.save()
        }
        //res.status(200).json({message:'Product added to wishlist successfully'})
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message)
    }
}














// const removeFromWishlist = async (req,res) => {
//     try {
//         // const {userId,productId} = req.body
//         const userId = req.session.user_id
//         const productId = req.params.productId

//         //check if the user and product exists
//         const user = await User.findById(userId)
//         console.log('user-----',user)
//         const product = await Product.findById(productId)
//         console.log('product------',product)

//         if(!user || !product){
//             return res.status(404).json({message:'User or product not found'})
//         }

//         // check if the product is in the wishlist 
//         const wishlist = await Wishlist.findOne({userid:userId})

//         if(!wishlist || !wishlist.products.includes(productId)){
//             return res.status(400).json({message:'Product not found in the wishlist '})
//         }

//         //Remove the product from the wishlist 
//         wishlist.products = wishlist.products.filter((id) => id.toString() !==productId)
//         await wishlist.save()

//         res.status(200).json({message:'Product removed from the wishlist successfully'})
//         res.render('wishlist')
//     } catch (error) {
//         console.log(error.message)
//     }
// }




















const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id; // Assuming you store the user ID in the session
        const productId = req.params.productId;

        // Check if the user and product exist
        const user = await User.findById(userId);
        const product = await Product.findById(productId);

        if (!user || !product) {
            return res.status(404).json({ message: 'User or product not found' });
        }

        // Check if the product is in the wishlist
        const wishlist = await Wishlist.findOne({ userid: userId });

        if (!wishlist || !wishlist.products.includes(productId)) {
            return res.status(400).json({ message: 'Product not found in the wishlist' });
        }

        // Remove the product from the wishlist
        wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ message: 'Product removed from the wishlist successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    wishlist,
    addToWishlist,
    removeFromWishlist
}