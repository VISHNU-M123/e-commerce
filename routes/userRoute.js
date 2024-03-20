const express = require('express')
const user_route = express()
const session = require('express-session')
const nocache = require('nocache')

const config = require('../config/config')
user_route.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }))

const auth = require('../middleware/auth')

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')

const bodyParser = require('body-parser')
user_route.use(nocache());
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true }))

const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})

const upload = multer({ storage: storage })

const userController = require('../controllers/userController')

user_route.get('/register', auth.isLogout, userController.register)

user_route.post('/register', upload.single('image'), userController.insertUser)

// user_route.get('/verify',userController.verifyMail)

user_route.get('/', auth.isLogout, userController.loadHome)
user_route.get('/login', auth.isLogout, userController.login)

user_route.post('/login', userController.verifylogin)


//otp
user_route.get('/otp', userController.otpVerification)
user_route.post('/otp', userController.verifyOtp)


//resend otp
user_route.get('/resendotp', userController.resendotp)


user_route.get('/home', auth.isAuthenticated, userController.loadHome)

user_route.post('/login', auth.isAuthenticated, userController.loadHome)

user_route.get('/logout', auth.isLogin, userController.userLogout)

user_route.get('/forget', auth.isLogout, userController.forgetLoad)

// user_route.post ('/forget',userController.forgetEmail)

user_route.get('/forget-password', auth.isLogout, userController.forgetPasswordLoad)

user_route.post('/forget-password', userController.resetPassword)


user_route.post('/login', userController.login)

user_route.get('/allproducts', auth.isAuthenticated, auth.isLogin,auth.isBlocked,auth.categoryFilterMiddleware, userController.allproducts)

user_route.get('/product', auth.isAuthenticated,auth.isBlocked, userController.product)


//cart
const cartController = require('../controllers/cartController')

//add to cart 
user_route.get('/cart',auth.isAuthenticated,cartController.cart)
user_route.get('/cart/:productId',auth.isAuthenticated,cartController.addToCart)
user_route.post('/addtocart', cartController.addToCart);

// delete from the cart

user_route.post('/cart/delete/:productId', cartController.deleteFromCart);

// Add a new route to update the quantity
user_route.post('/cart/update-quantity/:productId', cartController.updateQuantity);


//profile
user_route.get('/profile',auth.isAuthenticated,auth.isLogin,auth.isBlocked,userController.profile);


//address
const addressController = require('../controllers/addressController')
user_route.post('/address',addressController.addAddress)
// user_route.get('/adaddress',addressController.adAddress)
user_route.delete('/address/:addressId',addressController.deleteAddress)




user_route.post('/address', addressController.handleGenericAddress);

//edit address
user_route.get('/address/edit',addressController.editAddress)
user_route.post('/address/edit/:addressId',addressController.editAddress)



// checkout
user_route.get('/checkout',auth.isAuthenticated,auth.isLogin,auth.isBlocked,userController.checkout)



// place order 
const orderController = require('../controllers/orderController')
user_route.post('/placeorder',orderController.placeOrder)

user_route.post('/api/cancelorder',orderController.cancelOrder)

//return order
user_route.post('/api/returnorder', orderController.returnOrder);


// payment 
// user_route.post('/verifypayment',orderController.verifyPayment)


//wishlist 
const wishlistController = require('../controllers/wishlistController')
user_route.get('/wishlist',auth.isAuthenticated,wishlistController.wishlist)

user_route.get('/wishlist/:productId',wishlistController.addToWishlist)
user_route.post('/addtowishlist', wishlistController.addToWishlist);

user_route.delete('/wishlist/delete/:productId',wishlistController.removeFromWishlist)

user_route.post('/createOrder',orderController.createOrder)
user_route.post('/verifiaction',orderController.verifypayment)


//change password
user_route.post('/changepassword',userController.changePassword)




// forget password

user_route.get('/forgetpassword', userController.renderForgetPasswordPage);
user_route.post('/forgetpassword', userController.sendOTP);
user_route.get('/forgetotp', userController.renderOTPVerificationPage);
user_route.post('/forgetotp', userController.verifyOTP);
user_route.get('/forgetresendotp', userController.resendOTP);
user_route.post('/changeforgetpassword', userController.changeForgetPassword);
user_route.get('/newpassword', userController.renderNewPasswordPage);




// wallet
user_route.post('/deposit',userController.depositFunds)
user_route.post('/withdraw',userController.withdrawFunds)
user_route.get('/transactions/:userId',userController.getTransactionHistory)


module.exports = user_route;