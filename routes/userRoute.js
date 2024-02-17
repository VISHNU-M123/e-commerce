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

user_route.get('/allproducts', auth.isAuthenticated, auth.isLogin,auth.isBlocked, userController.allproducts)

user_route.get('/product', auth.isAuthenticated,auth.isBlocked, userController.product)




module.exports = user_route;