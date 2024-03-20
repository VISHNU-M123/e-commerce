const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')
const config = require('../config/config')

const nodemailer = require('nodemailer')
const Product = require('../models/product')
const Category = require('../models/category')
const Order = require('../models/orderModel')
const ExcelJS = require('exceljs')
const path = require('path')
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


//orders

const order = async (req, res) => {
    try {
        const order = await Order.find({}).populate('userId'); // Fetch all orders from the database
        res.render('order', { order }); // Pass the orders to the template
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., by rendering an error page
    }
}


const orderstatus = async (req, res) => {
    try {
        console.log('reached controll')
        const orderId = req.query.id;
        const newStatus = req.body.status;
console.log(newStatus)
        // Find the order by its ID and update its status
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
console.log(updatedOrder)
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        //res.json({ success: true, message: 'Order status updated successfully.', order: updatedOrder });
        res.redirect('/admin/orders')
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, error: 'Failed to update order status.' });
    }
};


const getorderstatus = async (req,res) => {
   
        try {
            const { orderId } = req.query;
            const order = await Order.findById(orderId);
            res.json({ status: order.status });
           // res.redirect('/order')
        } catch (error) {
            console.error('Error fetching order status:', error);
            res.status(500).json({ error: 'Failed to fetch order status.' });
        }
}








const salesReport = async (req,res) => {
    try {
        console.log("Sales Report route hit");
        const { startDate, endDate,reportType } = req.body;
        console.log("Received data:", { startDate, endDate ,reportType });


        // Validate startDate and endDate
        if (!startDate || !endDate) {
            res.render('salesReport', { orders: [] });
           // return res.status(400).json({ error: 'Start date and end date are required.' });
        }

        // Convert string dates to Date objects
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);


         // Set the time component of startDateTime to the beginning of the day
         startDateTime.setHours(0, 0, 0, 0);

         // Set the time component of endDateTime to the end of the day
         endDateTime.setHours(23, 59, 59, 999);

         console.log('Start Date:', startDateTime);
        console.log('End Date:', endDateTime);

        
        //const {reportType} = req.body
        let calculatedStartDateTime, calculatedEndDateTime

        if (reportType === 'Daily') {
            calculatedStartDateTime = startDateTime;
            calculatedEndDateTime = endDateTime;
        } else if (reportType === 'Weekly') {
            // Calculate start and end dates for the current week (Sunday to Saturday)
            const today = new Date();
            const currentDayOfWeek = today.getDay();
            calculatedStartDateTime = new Date(today);
            calculatedStartDateTime.setDate(today.getDate() - currentDayOfWeek); // Start of the week (Sunday)
            calculatedEndDateTime = new Date(today);
            calculatedEndDateTime.setDate(today.getDate() + (6 - currentDayOfWeek)); // End of the week (Saturday)
        } else if (reportType === 'Monthly') {
            // Calculate start and end dates for the current month
            calculatedStartDateTime = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), 1); // Start of the month
            calculatedEndDateTime = new Date(endDateTime.getFullYear(), endDateTime.getMonth() + 1, 0); // End of the month
        } else if (reportType === 'Yearly') {
            // Calculate start and end dates for the current year
            calculatedStartDateTime = new Date(startDateTime.getFullYear(), 0, 1); // Start of the year (Jan 1)
            calculatedEndDateTime = new Date(endDateTime.getFullYear(), 11, 31); // End of the year (Dec 31)
        }

         

        // Fetch orders between the given dates
        const orders = await Order.find({
            orderDate: {
                $gte: startDateTime,
                $lte: endDateTime,
            },
        })
        .populate('userId', 'name email') // Populate the user details
        .populate({
            path: 'products.productId',
            select: 'name price', // Adjust the fields you want to select
        })

        .sort({ orderDate: 1 });
        console.log('Fetched orders:', orders);

        // Render the salesReport page with the fetched orders
        res.render('salesReport',{ orders })

        // Generate Excel and send as a download
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // add headers
        worksheet.addRow(['User Name','Date','Address','Total','Payment Method','Status'])

        // add data
        orders.forEach((order) => {
            worksheet.addRow([
                order.userId.name,
                order.orderDate.toISOString().split('T')[0],
                order.userId.email,
                order.totalPrice,
                order.paymentMethod,
                order.status
            ])
        })

        // Set the content type and headers for the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        // Pipe the workbook to the response
        await workbook.xlsx.write(res);

        // End the response
        res.end();

        console.log('Sales report downloaded successfully');
    } catch (error) {
        console.log(error.message)
    }
}





// const downloadSalesReport = async (req, res) => {
//     try {
//         console.log("downloadSalesReport function called");
//         // Assuming you're passing the necessary data (e.g., order IDs) in the request body
//         const { orderIds } = req.body;
//         console.log("Received orderIds:", orderIds);

//         // Fetch orders based on the received order IDs
//         const orders = await Order.find({
//             _id: { $in: orderIds }
//         })
//         .populate('userId', 'name email') // Populate the user details
//         .populate({
//             path: 'products.productId',
//             select: 'name price', // Adjust the fields you want to select
//         });
//         console.log("Fetched orders:", orders);

//         // Generate Excel and send as a download
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sales Report');

//         // Add headers
//         worksheet.addRow(['User Name', 'Date', 'Address', 'Total', 'Payment Method', 'Status']);
//         console.log("Headers added to worksheet");

//         // Add data
//         orders.forEach((order) => {
//             worksheet.addRow([
//                 order.userId.name,
//                 order.orderDate.toISOString().split('T')[0],
//                 order.userId.email, // Assuming this is the address
//                 order.totalPrice,
//                 order.paymentMethod,
//                 order.status
//             ]);
//             console.log("Added order to worksheet:", order);
//         });

//         // Set the content type and headers for the Excel file
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

//         // Pipe the workbook to the response
//         await workbook.xlsx.write(res);
//         console.log("Workbook written to response");

//         // End the response
//         res.end();

//         console.log('Sales report downloaded successfully');
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Error generating sales report');
//     }
// }





const downloadSalesReport = async (req, res) => {
    try {
        console.log("downloadSalesReport function called");
        console.log("Received data:", req.body);
        // Assuming you're passing the necessary data in the request body
        
        // Create a single object representing an order
        const order = req.body

        // Generate Excel and send as a download
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add headers
        worksheet.addRow(['User Name', 'Date', 'Address', 'Total', 'Payment Method', 'Status']);
        console.log("Headers added to worksheet");

        // Add data
        order.forEach(order => {
            worksheet.addRow([
                order.userName,
                order.date,
                order.address,
                order.total,
                order.paymentMethod,
                order.status
            ]);
        console.log("Added order to worksheet:", order);
        })
        // Set the content type and headers for the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        // Pipe the workbook to the response
        await workbook.xlsx.write(res);
        console.log("Workbook written to response");

        // End the response
        res.end();

        console.log('Sales report downloaded successfully');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error generating sales report');
    }
}



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
    order,
    orderstatus,
    getorderstatus,
    salesReport,
    downloadSalesReport
}