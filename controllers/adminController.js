const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')
const config = require('../config/config')

const nodemailer = require('nodemailer')
const Product = require('../models/product')
const Category = require('../models/category')
require('dotenv').config()


const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash

    } catch (error) {
        console.log(error.message)
    }
    
}


//for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smpt.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                userr: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset password',
            html: '<p> Hii ' + name + ',please click here to <a href="http://localhost:3000/admin/forget-password?token=' + token + '"> reset </a> your password.</p>'
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message)
            } else {
                console.log('Email has been send :- ', info.response)
            }
        })


    } catch (error) {
        console.log(error.message)
    }
}

//login page
const loadLogin = async (req, res) => {
    try {

        console.log("login page");
        res.render('admin')
    } catch (error) {
        console.log(error.message + ' load login')
    }
}

//verify login
const verifyLogin = (req, res) => {
    try {

        const email = process.env.adminEmail
        console.log(req.body.email);
        console.log(email)
        const password = process.env.adminPassword
        const name = process.env.adminName
        if (email == req.body.email && password == req.body.password) {
            req.session.admin = name
            console.log(req.session)
            res.redirect("/admin/home")
            console.log(req.session.admin);
        } else {
            res.redirect("/admin/")
        }
    } catch (error) {

    }
}

//home page
const loadDashboard = async (req, res) => {
    try {

        res.render('home')
    } catch (error) {
        console.log(error.message)
    }
}

//logout
const logout = async (req, res) => {
    try {
        console.log('as;ldkfjasd;lfkj')
        req.session.destroy()
        console.log("logout");
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}


const forgetLoad = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}


const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({ email: email })
        if (userData) {
            if (userData.is_verified === true) {
                res.render('forget', { message: "Email is incorrect" })
            } else {
                const randomString = randomstring.generate()
                const updatedData = await User.updateOne({ email: email }, { set: { token: randomString } })
                sendResetPasswordMail(userData.name, userData.email, randomString)
                res.render('forget', { message: "Please check your email to reset your password" })
            }
        } else {
            res.render('forget', { message: "Email is incorrect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await User.findOne({ token: token })
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id })
        } else {
            res.render('404', { message: "Invalid Link" })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password
        const user_id = req.body.user_id
        const securePass = await securePassword(password)
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: securePass, token: '' } })
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

//all users page
const allUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.render('allusers', { users })
    } catch (error) {
        console.log(error.message)
    }
}

//all products page
const allproducts = async (req, res) => {
    try {
        const products = await Product.find().populate('Category');

        res.render('allproducts', { product: products });
    } catch (error) {
        console.log(error.message);
    }
};

//category page
const category = async (req, res) => {
    try {
        const category = await Category.find()
        res.render('category', { category: category })
    } catch (error) {
        console.log(error.message)
    }
}

//user status
const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.userId; // Assuming userId is passed in the route params
        const user = await User.findById(userId);

        if (user) {
            // Toggle the user status
            user.Status = user.Status === 'blocked' ? 'active' : 'blocked';
            await user.save();

            res.redirect('/admin/allusers'); // Redirect to the user list page
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    allUsers,
    allproducts,
    category,
    toggleUserStatus,


}