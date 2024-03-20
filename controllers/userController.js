const User = require('../models/userModel');
const Address=require('../models/addressModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const Product = require('../models/product')
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
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
       console.log("otp : -",otp)
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
        req.session.user_id = User._id
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


        const blockedCategories = await Category.find({Status:'blocked'}).select('_id')

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
        }else if(sortOption === 'latest') {
            sort = { _id: -1}
        }

        
        let filter = {};
        if (search) {
            filter.Name = { $regex: new RegExp(search, 'i') };
            console.log('filter object',filter)
        }


        if(selectedCategory !== 'all'){

            const category = await Category.findOne({ Name: selectedCategory }).select('_id');
            if (category) {
                filter.$and = [{ Category: category._id }, { Category: { $nin: blockedCategories } }];
                // filter.Category = category._id;
            }
            //filter.Category = selectedCategory;

            console.log('filter object',filter)
        }

        filter.Category = {$nin:blockedCategories}

        // Fetch total products after filtering
        let totalProducts = await Product.countDocuments(filter);
        let totalPages = Math.ceil(totalProducts / perPage);

        // Fetch products with sorting, filtering, and pagination
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(perPage)
            .exec();

           // console.log('Retrieved Products:', products);


        res.render('allproducts', { products, totalPages, currentPage, sortOption, search, selectedCategory, Category   });
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

        // console.log('Related Products:', relatedProduct);

        res.render('product',{product:product,relatedProduct})
    } catch (error) {
        console.log(error.message)
    }
}





const profile = async (req, res) => {
    try {
        console.log("Profile route hit"); 
        const userId = req.session.user_id;
        //console.log("User ID:", userId); 
        const userAddresses = await Address.find({ userId: userId });
        //console.log("User Addresses:", userAddresses); 

        const userWallet = await Wallet.findOne({ userId: userId });
        console.log('userwallet---',userWallet)
        // Fetch the user and populate the 'orders' field
        const user = await User.findById(userId).populate({
            path: 'orders',
            populate: {
                path: 'products.productId',
                model: 'Product' // Assuming 'Product' is the name of your product model
            }
        });
        //console.log("User:", user);

        // Debugging: Log the populated orders to check if they are fetched correctly
        //console.log("Populated Orders:", user);

        if (!user) {
            return res.status(404).send('User not found');
        }

        console.log("Rendering profile template with data"); 
        // Pass the userAddresses, userId, user, and orders to the template
        res.render('profile', { userAddresses: userAddresses[0], userId: userId, user, orders: user.orders , userName:user.name ,transactions:'',  userwallet: userWallet});
    } catch (error) {
        console.log("Error in profile route:", error.message);
        // Handle error appropriately, e.g., by sending a response to the client
        res.status(500).send('Server Error');
    }
};




const checkout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const selectedAddressId = req.body.selectedAddressId;
     
        let selectedAddress = null;
    
        if (selectedAddressId) {
          // Fetch the selected address details
          selectedAddress = await Address.findById(selectedAddressId);
        }

        const cart = await Cart.findOne({ userid: userId }).populate('products.productId');

        // Check if the cart is empty
        if (!cart || cart.products.length ===  0) {
            // Send a response with an error message
            //return res.status(400).json({ error: 'Your cart is empty. Please add items to your cart before proceeding to checkout.' });
            return res.redirect('/cart')
        }

        let total =  0;
        let productNames = []
        let productPrice=0
        cart.products.forEach((item) => {
            total += item.totalPrice;
            productNames.push(item.productId.Name)
            productPrice = item.totalPrice
        });

        const userAddresses = await Address.find({ userId: userId });


        // Fetch the list of available coupons from the database
        const coupons = await Coupon.find();

        res.render('checkout', { userAddresses: userAddresses[0], selectedAddressId, userId: userId, total , productNames , productPrice,coupons});
    } catch (error) {
        console.log(error.message);
        // Send a response with an error message
        return res.status(500).json({ error: 'An error occurred while processing your request. Please try again later.' });
    }
};
   




//change password from the profile page 

const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword, confirmPassword } = req.body;

        // Check if required fields are provided
        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Fetch the user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the provided current password matches the user's current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid current password.' });
        }

        // Check if the new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match.' });
        }

        // Hash the new password
        const hashedNewPassword = await securePassword(newPassword);

        // Update the user's password
        user.password = hashedNewPassword;


        // Save the updated user object
        await user.save();
        
        return res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};




// forget password 

// Render forget password page
const renderForgetPasswordPage = (req, res) => {
   try {
    
    console.log('Rendering forget password page');
    res.render('forgetpassword');
   } catch (error) {
    console.log(error.message)
   }
};

// Send OTP for forget password
const sendOTP = async (req, res) => {
    try {
        console.log('Sending OTP');
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found');
            console.log('User not found');
            return res.redirect('/forgetpassword');
        }
        await sendforgetVerifyMail(user.name, email, user._id, res);
    } catch (error) {
        console.error('Error sending OTP:', error);
        req.flash('error', 'An error occurred while sending OTP. Please try again.');
        res.redirect('/forgetpassword');
    }
};

// Render OTP verification page forget password
const renderOTPVerificationPage = (req, res) => {
    console.log('Rendering OTP verification page');
    const { email } = req.query;
    console.log(email,':email yethi')
    res.render('forgetotp', { email });
};


// Verify OTP forget password
const verifyOTP = async (req, res) => {
    try {
        console.log('Verifying OTP');
        
        const { email, digit1, digit2, digit3, digit4 } = req.body;
        const otp = digit1 + digit2 + digit3 + digit4;
        const otpVerification = await UserOtpVerification.findOne({ email });
        
        if (!otpVerification) {
            req.flash('error', 'Invalid OTP >>>>1');
            console.log('Invalid OTP');
            return res.redirect(`/forgetotp?email=${email}`);
        }
        console.log('req.sesion',req.session)
        const validOTP = await bcrypt.compare(otp, otpVerification.otp);
        if (!validOTP) {
            req.flash('error', 'Invalid OTP>>>>>2');
            console.log('Invalid OTP');
            return res.redirect(`/forgetotp?email=${email}`);
        }
        // If OTP is valid, delete the OTP verification record
        await UserOtpVerification.deleteOne({ email });
        console.log('Redirecting to new password page');
        res.redirect(`/newpassword?email=${email}`);
        console.log('Redirecting to new password page');
       
    } catch (error) {
        console.error('Error verifying OTP:', error);
        req.flash('error', 'An error occurred while verifying OTP. Please try again.');
        res.redirect(`/forgetotp?email=${email}`);
    }
};

// Resend OTP forget password
const resendOTP = async (req, res) => {
    try {
        console.log('Resending OTP');
        const { email } = req.query;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found');
            console.log('User not found');
            return res.redirect('/forgetpassword');
        }
        await sendforgetVerifyMail(user.name, email, user._id, res);
    } catch (error) {
        console.error('Error resending OTP:', error);
        req.flash('error', 'An error occurred while resending OTP. Please try again.');
        res.redirect('/forgetpassword');
    }
};


// Change password forget password
const changeForgetPassword = async (req, res) => {
    try {
        console.log(req.query,req.body,';email undo')
       
        console.log('Changing forget password');
        const { newPassword, confirmPassword } = req.body;
        // console.log('req.body',req.body)
        // const { email } = req.user; // Assuming you have middleware to extract user info from the request
        
        const email=req.body.email
        console.log("email",email);
        if (newPassword !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            console.log('Passwords do not match');
            return res.redirect('/newpassword');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        console.log('Password updated successfully');
        req.flash('success', 'Password updated successfully');
        console.log(req.session,':the session undo')
        res.redirect('/login');

    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error', 'An error occurred while changing password. Please try again.');
        res.redirect('/newpassword');
    }
};


// Function to send verification mail forget password
const sendforgetVerifyMail = async (name, email, user_id, res) => {
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

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
            console.log('otp....',otp)
        // mail options
        const mailOptions = {
            from: 'vishnuthambankv@gmail.com',
            to: email,
            subject: "Verify Your email",
            html: `Your OTP is: ${otp}`
        };

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);

        const newOtpVerification = new UserOtpVerification({ email, otp: hashedOTP });
        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);

        if (res) {
            res.redirect(`/forgetotp?email=${email}`);
        }
    } catch (error) {
        console.error('Error sending verification mail:', error);
    }
};



const renderNewPasswordPage = (req, res) => {
    const { email } = req.query;
    res.render('newpassword', { email }); // Render new password page with email parameter
};






// wallet 

const depositFunds = async (req, res) => {
    const userId = req.session.user_id;
    const depositAmount = parseFloat(req.body.amount);
    
    try {
        if (isNaN(depositAmount) || depositAmount <= 0) {
            throw new Error('Invalid deposit amount');
        }

        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            wallet = new Wallet({ userId });
        }

        wallet.balance += depositAmount;
        wallet.transactions.push({
            type: 'credit',
            reason: 'Deposit funds',
            transactionAmount: depositAmount
        });

        await wallet.save();

        // Update wallet balance and transaction history in the response
        const updatedWallet = await Wallet.findOne({ userId });
        res.status(200).json({ message: 'Funds deposited successfully', balance: updatedWallet.balance, transactions: updatedWallet.transactions });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: error.message });
    }
};


const withdrawFunds = async (req, res) => {
    const userId = req.session.user_id; // Assuming user id is stored in the session
    const withdrawAmount = parseFloat(req.body.amount);
    try {
        let wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < withdrawAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        wallet.balance -= withdrawAmount;
        wallet.transactions.push({
            type: 'debit',
            reason: 'Withdraw funds',
            transactionAmount: withdrawAmount
        });
        await wallet.save();
        res.status(200).json({ message: 'Funds withdrawn successfully', balance: wallet.balance });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to withdraw funds' });
    }
}


const getTransactionHistory = async (req,res) => {
    const {userId} = req.params
    try {
        const wallet = await Wallet.findOne({userId})

        if(!wallet){
            return res.status(404).json({message:'Wallet not found'})
        }
        res.staus(200).json({transactions:wallet.transactions})
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
    profile,
    checkout,
    changePassword,
    changeForgetPassword,
    renderForgetPasswordPage,
    renderOTPVerificationPage,
    verifyOTP,
    resendOTP,
    sendforgetVerifyMail,
    sendOTP,
    renderNewPasswordPage,
    depositFunds,
    withdrawFunds,
    getTransactionHistory

}