const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const Product = require('../models/product')
const config = require('../config/config')
const UserOtpVerification= require("../models/otpModel")
const randomString = require('randomstring')

const Category = require('../models/category');
const { default: mongoose } = require('mongoose');

const securePassword = async(password) => {

    try {
        
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        console.log(error.message)
    }

}

// To send mail 
const sendVerifyMail = async (name, email, user_id, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'vishnuthambankv@gmail.com',
                pass: 'aucb yafc etas lcoe'
            }
        });

      const  otp = `${
            Math.floor(1000 + Math.random() * 9000)
        }`;

        // mail options
        const mailOptions = {
            from: 'vishnuthambankv@gmail.com',
            to: email,
            subject: "Verify Your email",
            html: `Your OTP is: ${otp}`
        };

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        const newOtpVerification =  new UserOtpVerification({ email: email, otp: hashedOTP });
        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);

        // Now you can use res.redirect here
        console.log('sendverifymail email =======>',email)
        if(res){
        res.redirect(`/otp?email=${email}`);
        }
    } catch (error) {
        console.log(error.message);
    }
};


const otpVerification = async (req,res) => {
    try {
        const email = req.query.email
        console.log('email:------->',email)
        res.render('otpVerification',{email})
       
    } catch (error) {
        console.log(error.message)
    }
}

//otp verify
const verifyOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const { digit1, digit2, digit3, digit4 } = req.body;
        const otp = digit1 + digit2 + digit3 + digit4;

        const userVerification = await UserOtpVerification.findOne({ email: email });
        console.log('userVerification:', userVerification);

        if (!userVerification) {
            console.log("otp expired");
            req.flash('error', 'Invalid OTP');
            return res.redirect(`/otp?email=${email}`);
        }

        const { otp: hashedOtp } = userVerification;
        console.log('hashedOtp:', hashedOtp);

        const validOtp = await bcrypt.compare(otp, hashedOtp);
        console.log('validOtp:', validOtp);

        if (validOtp) {
            const userData = await User.findOne({ email });

            if (userData) {
                await User.updateOne(
                    { _id: userData._id },
                    {
                        $set: {
                            is_verified: true,
                        },
                    }
                );
            }

            // Delete the OTP record
            await UserOtpVerification.deleteOne({ email });

            return res.redirect('/login?success=Registration successful!');
        } else {
            req.flash('error', 'Invalid OTP');
            return res.redirect(`/otp?email=${email}`);
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'Internal Server Error');
        return res.redirect("/500");
    }
};




//resend otp
const resendotp = async (req,res) => {
    try {

        const email = req.query

        console.log(req.query)
        console.log("dfjslkslkfkm")
        
        const dataOfUser = await User.findOne({email:req.query.email})
        console.log(dataOfUser)
        sendVerifyMail(dataOfUser.name, req.query.email, dataOfUser._id) 
        res.render('otpVerification',{email:req.query.email})

       
    } catch (error) {
        console.log(error.message)
    }
}




//  for reset password send mail

const sendResetPasswordMail = async (name,email,token) => {
    try {
        const transporter = nodemailer.createTransport({
            host : 'smpt.gmail.com',
            port : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user :  'vishnuthambankv@gmail.com' ,
                pass : 'aucb yafc etas lcoe'
            }
        })
        const mailOptions = {
            from : config.emailUser,
            to : email,
            subject : 'For Reset password',
            html : '<p> Hii '+name+',please click here to <a href="http://localhost:3000/forget-password?token='+token+'"> reset </a> your password.</p>'
        } 

        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error.message)
            }else{
                console.log('Email has been send :- ',info.response)
            }
        })


    } catch (error) {
        console.log(error.message)
    }
}


const register = async (req, res) => {
    try {
        res.render('registration'); // Assuming you want to render the 'register' page
    } catch (error) {
        console.log(error.message);
    }
}


//registration of users
const insertUser = async (req, res) => {
    try {
        // Trim user inputs to remove leading and trailing spaces
        const name = req.body.name.trim();
        const email = req.body.email.trim();
        const mobile = req.body.mobile.trim();
        const password = req.body.password;

        // Validate inputs
        if (!name || !email || !mobile || !password) {
            const err = "Please fill in all the fields";
           // return res.render('registration', { err }); // Redirect to the registration page
           return res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
        }

        // validate name
        const nameRegex = /^[a-zA-Z\s]*$/;
        if (!nameRegex.test(name)) {
            const err = "Please enter a valid name without numbers or special characters";
           // return res.render('registration', { err }); // Redirect to the registration page
           return res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
        }


        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const err = "Please enter a valid email";
           // return res.render('registration', { err }); // Redirect to the registration page
           return res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
        }

        // Validate mobile (assuming 10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            const err = "Please enter a valid mobile number";
           // return res.render('registration', { err }); // Redirect to the registration page
           return res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
        }

        // Validate password (assuming at least 6 characters)
        if (password.length < 6) {
            const err = "Password must be at least 6 characters";
            //return res.render('registration', { err }); // Redirect to the registration page
            return res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
        }

        // Check if email is already taken
        const check = await User.findOne({ email });
        if (check) {
            const err = "Email already taken";
            console.log('email areready taken')
           // return res.render('registration', { err }); // Redirect to the registration page
          // return res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
          return res.redirect('/register?error=emailTaken');
        }

        // Hash the password
        const spassword = await securePassword(password);

        // Create a new user
        const user = new User({
            name,
            email,
            mobile,
            password: spassword,
        });

        // Save the user to the database
        const userData = await user.save();

        if (userData) {
            // Assuming you want to redirect to the 'otp' page
            sendVerifyMail(name, email, userData._id);
        
            
            return res.render('otpVerification',{email});
            
        } else {
            const err = "Registration failed. Please try again.";
            return res.render('registration', { err }); // Redirect to the registration page
        }
    } catch (error) {
        console.log(error.message);
        const err = "An error occurred during registration";
        //res.render('registration', { err }); // Redirect to the registration page
        res.send(`<script>Swal.fire('Error', '${err}', 'error').then(() => { window.location.href = '/registration' });</script>`);
    }
}



const login = async (req,res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}



const loadHome = async (req,res) => {
    try {
        const userId = req.session.user_id

        
        res.render('home',{userAuthenticated:req.session.user_id})
    } catch (error) {
        console.log(error.message)
    }
}

const loginsubmit = async (req,res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message)
    }
}


const verifylogin = async (req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({email : email,Status:'active'})
        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password)
             if(passwordMatch){
                if(userData.is_verified === false){
                    res.render('login',{message:"Please verify your mail"})
                }else{
                    req.session.user_id = userData
                    res.redirect('/home')
                }
             }else{
                res.redirect( '/login');
                //res.redirect('/login',{message:"Email or password is in correct"})
             }
        }else{
            res.redirect( '/login');

          //  res.redirect('/login',{message:"Email or password is incorrect"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async (req,res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}


//forget password code start

const forgetLoad = async (req,res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message)
    }
}



const forgetVerify = async (req,res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({email:email})
        if(userData){
            
             if(userData.is_verified === true){
                res.render('forget',{message:'please verify your mail'})
             }else{
                const randomString = randomString.generate()
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
                sendResetPasswordMail(userData.name,userData.email,)
                 res.render('forget',{message:"please check your mail to reset your password"})
             }

        }else{
            res.render('forget',{message:"user email is incorrect"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad = async (req,res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({token:token})
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})
        }else{
            res.render('404',{message:"token is invalid"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword = async (req,res) => {
    try {

        const password = req.body.password
        const user_id = req.body.user_id

        const secure_password = await securePassword(password)

        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})

         res.redirect('/')


    } catch (error) {
        console.log(error.message)
    }
}


const allproducts = async (req,res) => {



    try {
        const sortOption = req.query.sort;
        const search = req.query.search;  // Assuming search is in the query parameters
        const selectedCategory = req.query.category || 'all'
        console.log('selected category',selectedCategory)


        // Pagination parameters
        const perPage = 6;
        const currentPage = parseInt(req.query.page, 10) || 1;
        const skip = (currentPage - 1) * perPage;

        // Sorting options
        let sort = {};
        if (sortOption === 'default') {
            sort = { date: -1 };
        } else if (sortOption === 'priceLowToHigh') {
            sort = { Price: 1 };
        } else if (sortOption === 'priceHighToLow') {
            sort = { Price: -1 };
        } else if (sortOption === 'name') {
            sort = { Name: 1 };
        }

        
        let filter = {};
        if (search) {
            filter.Name = { $regex: new RegExp(search, 'i') };
            console.log('filter object',filter)
        }


        if(selectedCategory !== 'all'){

            const category = await Category.findOne({ Name: selectedCategory }).select('_id');
            if (category) {
                filter.Category = category._id;
            }
            //filter.Category = selectedCategory;

            console.log('filter object',filter)
        }


        // Fetch total products after filtering
        let totalProducts = await Product.countDocuments(filter);
        let totalPages = Math.ceil(totalProducts / perPage);

        // Fetch products with sorting, filtering, and pagination
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(perPage)
            .exec();

            console.log('Retrieved Products:', products);


        res.render('allproducts', { products, totalPages, currentPage, sortOption, search, selectedCategory  });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }


    // try {
    //     const perPage = 3; // Set the number of products to display per page
    //     const page = parseInt(req.query.page) || 1; // Get the requested page or default to 1
    //      const product = await Product.find().skip((page - 1) * perPage)
    //      .limit(perPage);
    //      const totalProducts = await Product.countDocuments({ Status: { $ne: "blocked" } });
    //      const totalPages = Math.ceil(totalProducts / perPage);
    //     res.render('allproducts',{product:product,totalPages, currentPage: page })
    // } catch (error) {
    //     console.log(error.message)
    // }
}


const product = async (req,res) => {
    try {

        const productId = req.query.id;
        console.log(productId)
        console.log(req.query);
        const product = await Product.findById(productId).populate('Category').exec()
        // console.log(product)

        const relatedProduct = await Product.find({
            Category: product.Category,
            _id: {
                $ne: product._id
            }
        }).populate('Category').limit(4);

         console.log('Related Products:', relatedProduct);

        res.render('product',{product:product,relatedProduct})
    } catch (error) {
        console.log(error.message)
    }
}






module.exports = {
    
    
    register,
    insertUser,
    // verifyMail,
    verifyOtp,
    login,
    otpVerification,
    loadHome,
    loginsubmit,
    verifylogin,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    allproducts,
    product,
    resendotp,
    
   
}
