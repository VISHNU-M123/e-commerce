const mongoose = require('mongoose');

const Cart = require('../models/cartModel');
const Product = require('../models/product');

const getCartByUserId = async (userId) => {
    try {
        const cart = await Cart.findOne({ userid: userId }).populate('products.productId');
        console.log('Cart retrieved:', cart);
        return cart;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};


// //-------original cart starts---------

// const calculateTotalAmount = (products) => {
//     // Assuming each product has a 'totalPrice' property
//     return products.reduce((total, product) => total + product.totalPrice, 0);
// };


// // const cart = async (req, res) => {
// //     try {
// //         const userId = req.session.user_id;



// //         // Fetch cart data
// //         const cartData = await getCartByUserId(userId);

// //         //const cartData = await Cart.findOne({ userid: req.session.user_id });

// //         if (!cartData || !cartData.products) {
// //             // Handle case when cart is null or doesn't have 'products'
// //             res.render('cart', { cart: { products: [] } });
// //             return;
// //         }

// //          // Calculate total amount based on cart products
// //          const totalAmount = calculateTotalAmount(cartData.products);


// //         res.render('cart', { cart: cartData , totalAmount});
// //     } catch (error) {
// //         console.log(error.message);
// //         res.status(500).send('Internal Server Error');
// //     }
// // };


// const cart = async (req, res) => {
//     try {
//         const userId = req.session.user_id;

//         // Fetch cart data
//         const cartData = await getCartByUserId(userId)
//         console.log(cartData)

//         let total = 0;
//         cartData.products.forEach((item)=> {
//             total += item.totalPrice;

//         })


//         if (!cartData || !cartData.products || cartData.products.length === 0) {
//             // Handle case when cart is null or doesn't have 'products'
//             res.render('cart', { cart: { products: [], grandTotal: 0  } , total:0,shwoAlert :true });
//             return;
//         }

//         // Calculate total amount based on cart products
//         //const grandTotal = calculateGrandTotal(cartData.products);


//         res.render('cart', { cart: cartData , total:total });
//     } catch (error) {
//         console.error(error.message);
//         res.render('cart', { cart: { products: [], grandTotal: 0  } , total:0,shwoAlert :true });
//        // res.status(500).send('Internal Server Error');
//         //   res.status(500).json({ error: 'Internal Server Error', message: 'Your cart is empty.' });
//     }
// };





// const calculateGrandTotal = (products) => {
//     return products.reduce((total, product) => total + product.totalPrice, 0);
// };



// const addToCart = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const productId = req.params.productId;

//         console.log('productId:', productId);

//         // Validate if productId is a valid ObjectId before querying the database
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             console.error('Invalid Product ID');
//             // Handle the error, maybe redirect to an error page or return an error response
//            // res.status(400).send('Invalid Product ID');
//            res.redirect('/cart')
//             return;
//         }

//         // Find the product details
//         const product = await Product.findById(productId);

//         // check if the user already has a cart
//         let userCart = await Cart.findOne({ userid: userId });

//         // if a user has no cart then create a new one
//         if (!userCart) {
//             userCart = new Cart({
//                 userid: userId,
//                 products: [],
//             });
//         }

//         // check if the product is already added in the cart
//         const existingProduct = userCart.products.find(
//             (item) => item.productId.toString() === productId
//         );

//         if (existingProduct) {
//             existingProduct.quantity += 1;
//             existingProduct.totalPrice =
//                 existingProduct.quantity * existingProduct.productPrice;
//         } else {
//             // if the product is not in the cart
//             userCart.products.push({
//                 productId: productId,
//                 quantity: 1,
//                 productPrice: product.Price,
//                 totalPrice: product.Price,
//                 image: product.Images[0], // store the first image of the product
//             });
//         }

//         await userCart.save();

//         // Calculate the total based on the updated products in the cart
//         let total = 0;
//         userCart.products.forEach((item) => {
//             total += item.totalPrice;
//         });

//         // Fetch updated cart data and render the 'cart' view with the total
//         const updatedUserCart = await getCartByUserId(userId);
//         res.render('cart', { cart: updatedUserCart, products: updatedUserCart.products, total: total });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };


// // const deleteFromCart = async (req, res) => {
// //     try {


// //         console.log('l;fasjdjlksadfjlsakd')
// //         const userId = req.session.user_id;
// //         const productIdToDelete = req.params.event

// //         console.log(productIdToDelete)

// //         // Find the user's cart
// //         const userCart = await Cart.findOne({ userid: userId });

// //         if (!userCart || !userCart.products) {
// //             res.status(404).send('Cart not found');
// //             return;
// //         }

// //         // Find the index of the product to delete
// //         const productIndex = userCart.products.findIndex((item) => item.productId.toString() === productIdToDelete);

// //         if (productIndex !== -1) {
// //             userCart.products.splice(productIndex, 1);

// //             try {
// //                 // Save the user's cart and wait for it to complete
// //                 await userCart.save();
// //                 console.log('Cart saved');

// //                 // Redirect to the '/cart' page after successful deletion
// //                 res.redirect('/cart');
// //             } catch (error) {
// //                 console.log('Error saving cart:', error.message);
// //                 res.status(500).send('Internal Server Error');
// //             }
// //         } else {
// //             res.redirect('/cart');
// //         }
// //     } catch (error) {
// //         console.log(error.message);
// //         res.status(500).send('Internal Server Error');
// //     }
// // };



// const deleteFromCart = async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const userId = req.session.user_id._id;

//         console.log(`Deleting product with ID: ${productId} for user: ${userId}`);

//         const cart = await Cart.findOne({ userid: userId });
//         if (!cart) {
//             return res.status(404).json({ message: 'Cart not found' });
//         }

//         console.log('Cart before deletion:', cart);

//         // Ensure the product exists in the cart
//         const productExists = cart.products.some(product => product.productId.equals(productId));
//         if (!productExists) {
//             return res.status(404).json({ message: 'Product not found in the cart' });
//         }

//         // Filter out the product to be deleted
//         cart.products = cart.products.filter(product => !product.productId.equals(productId));

//         console.log('Cart after deletion:', cart);

//         await cart.save();
//         res.json({ message: 'Product removed from the cart', cart });
//     } catch (error) {
//         console.error('Error deleting product:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };



// // const updateQuantity = async (req, res) => {
// //     try {
// //         const userId = req.session.user_id;
// //         const productId = req.params.productId;
// //         const newQuantity = req.body.quantity;

// //         // Find the user's cart
// //         const userCart = await Cart.findOne({ userid: userId });

// //         if (!userCart || !userCart.products) {
// //             return res.status(404).json({ message: 'Cart not found' });
// //         }

// //         // Find the product in the cart
// //         const productInCart = userCart.products.find(item => item.productId.equals(productId));

// //         console.log('product in cart -----xxxxxxx----',productInCart)

// //         if (!productInCart) {
// //             return res.status(404).json({ message: 'Product not found in the cart' });
// //         }

// //         // Update the quantity
// //         productInCart.quantity = newQuantity;
// //         productInCart.totalPrice = newQuantity * productInCart.productPrice;

// //         // Recalculate grand total
// //         userCart.grandTotal = calculateGrandTotal(userCart.products);
// //         console.log('Grand Total:', userCart.grandTotal);
// //         await userCart.save();

// //         res.json({
// //             message: 'Quantity updated successfully',
// //             grandTotal: userCart.grandTotal,
// //         });
// //     } catch (error) {
// //         console.error('Error updating quantity:', error);
// //         res.status(500).json({ message: 'Internal Server Error' });
// //     }
// // };




// const updateQuantity = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const productId = req.params.productId;
//         const newQuantity = req.body.quantity;

//         // Find the user's cart
//         const userCart = await Cart.findOne({ userid: userId });

//         if (!userCart || !userCart.products) {
//             return res.status(404).json({ message: 'Cart not found' });
//         }

//         // Find the product in the cart
//         const productInCart = userCart.products.find(item => item.productId.equals(productId));

//         if (!productInCart) {
//             return res.status(404).json({ message: 'Product not found in the cart' });
//         }

//         // Update the quantity
//         productInCart.quantity = newQuantity;
//         productInCart.totalPrice = newQuantity * productInCart.productPrice;

//         // Recalculate grand total
//         userCart.grandTotal = calculateGrandTotal(userCart.products);
//         await userCart.save();

//         // Fetch updated cart data to get the new total
//         const updatedUserCart = await getCartByUserId(userId);
//         const newTotal = calculateGrandTotal(updatedUserCart.products);

//         res.json({
//             message: 'Quantity updated successfully',
//             grandTotal: newTotal, // Send the new total to the client
//         });
//     } catch (error) {
//         console.error('Error updating quantity:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

//------original ends----------


const cart = async (req, res) => {
    try {

        const cart = await Cart.findOne({ userid: req.session.user_id }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        // Calculate the total and grand total
        let total = 0;
        let grandTotal = 0;
        cart.products.forEach(product => {
            total += product.quantity * product.productPrice;
            grandTotal += product.totalPrice;
        });

        res.render('cart', { cart: cart, total: total, grandTotal: grandTotal });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// const addToCart = async (req, res) => {
//     try {
//         const productId = req.params.productId;
//         console.log("dynamic params : ",productId);
//         console.log("dynamic params : ",typeof productId);
//         const cart = await Cart.findOne({ userid: req.session.user_id });
//         console.log("cart ",cart);
//         let productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

//         // Find the product in the database
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         if (productIndex > -1) {
//             // Product exists, update quantity
//             cart.products[productIndex].quantity++;

//             // Update totalPrice for the product
//             cart.products[productIndex].totalPrice = cart.products[productIndex].quantity * product.Price;
//         } else {
//             // Product does not exist, add new product
//             const product = await Product.findById(productId);
//             const imageUrl = product.Images[0];
//             cart.products.push({
//                 productId: productId,
//                 quantity: 1,
//                 productPrice: product.Price,
//                 totalPrice: product.Price,
//                 image: imageUrl
//             });
//         }

//         // Update grandTotal
//         cart.grandTotal = cart.products.reduce((total, product) => total + product.totalPrice, 0);

//         await cart.save();

//         res.redirect('/cart');
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const addToCart = async (req, res) => {
//     const { productId } = req.params;
//     const userId = req.session.userId;

//     try {
//         // Fetch the product from the database
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         // Check if there is enough stock available
//         if (product.stock <= 0) {
//             return res.status(400).json({ error: 'Product is out of stock' });
//         }

//         // Fetch the user's cart
//         let cart = await Cart.findOne({ userid: userId });

//         // If the cart doesn't exist, create a new one
//         if (!cart) {
//             cart = new Cart({ userid: userId });
//         }

//         // Check if the product is already in the cart
//         const existingProductIndex = cart.products.findIndex(item => item.productId.equals(productId));

//         if (existingProductIndex !== -1) {
//             // If the product is already in the cart, increase its quantity if stock available
//             if (product.stock > cart.products[existingProductIndex].quantity) {
//                 cart.products[existingProductIndex].quantity++;
//             } else {
//                 return res.status(400).json({ error: 'Not enough stock available' });
//             }
//         } else {
//             // If the product is not in the cart, add it with quantity 1
//             cart.products.push({
//                 productId: productId,
//                 quantity: 1,
//                 productPrice: product.price,
//                 image: product.image // Assuming the product model has an 'image' field
//             });
//         }

//         // Update the total price in the cart
//         cart.grandTotal += product.price;

//         // Save the updated cart
//         await cart.save();

//         res.status(200).json({ message: 'Product added to cart successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const addToCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log("dynamic params : ", productId);
        console.log("dynamic params : ", typeof productId);
        
        // Find the user's cart
        let cart = await Cart.findOne({ userid: req.session.user_id });
        
        if (!cart) {
            // If user doesn't have a cart, create a new one
            cart = new Cart({ userid: req.session.user_id, products: [] });
        }
        
        console.log("cart ", cart);
        let productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        // Find the product in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (productIndex > -1) {
            // Product exists, update quantity if there's enough stock
            if (product.Quantity > cart.products[productIndex].quantity) {
                cart.products[productIndex].quantity++;
            } else {
                return res.status(400).json({ message: 'Not enough stock available' });
            }

            // Update totalPrice for the product
            cart.products[productIndex].totalPrice = cart.products[productIndex].quantity * product.Price;
        } else {
            // Product does not exist, add new product if there's enough stock
            if (product.Quantity > 0) {
                const imageUrl = product.Images[0];
                cart.products.push({
                    productId: productId,
                    quantity: 1,
                    productPrice: product.Price,
                    totalPrice: product.Price,
                    image: imageUrl
                });
            } else {
                return res.status(400).json({ message: 'Not enough stock available' });
            }
        }

        // Update grandTotal
        cart.grandTotal = cart.products.reduce((total, product) => total + product.totalPrice, 0);

        await cart.save();

        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const deleteFromCart = async (req, res) => {
    try {
        const productId = req.params.productId;
        const cart = await Cart.findOne({ userid: req.session.user_id });
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex > -1) {
            // Calculate the productPrice before removing the product
            const productPrice = cart.products[productIndex].productPrice;

            // Remove the product from the cart
            cart.products.splice(productIndex, 1);

            // Subtract the productPrice from the grandTotal
            cart.grandTotal -= productPrice;

            await cart.save();
        }


        res.json({ message: 'Product removed from cart', success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const productId = req.params.productId;
        // const quantity = req.body.quantity;
        const quantity = parseInt(req.body.quantity, 10)
        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative' });
        }
        const cart = await Cart.findOne({ userid: req.session.user_id });
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex > -1) {
            const product = cart.products[productIndex];
            const priceDifference = (quantity - product.quantity) * product.productPrice;
            product.quantity = quantity;
            product.totalPrice = quantity * product.productPrice;
            cart.grandTotal += priceDifference;

            let subtotal = 0
            cart.products.forEach(product => {
                subtotal += product.quantity * product.productPrice
            })
            await cart.save();
            res.json({ success: true, subtotal: subtotal, grandTotal: cart.grandTotal});

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    cart,
    addToCart,
    deleteFromCart,
    updateQuantity,
};