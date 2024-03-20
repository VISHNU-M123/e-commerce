const express = require('express')
const admin_route = express()

const path = require('path')
const session = require('express-session')
const config = require('../config/config')
admin_route.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: false }))

const multer = require('multer')

const nocache = require('nocache')
admin_route.use(nocache())
const bodyParser = require('body-parser')
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }))

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')


//admin_route.set('view options', { debug: true });



const adminAuth = require('../middleware/adminAuth')


const adminController = require('../controllers/adminController')

admin_route.get('/', adminAuth.isLogout, adminController.loadLogin)

admin_route.post('/loginsubmit', adminAuth.isLogout, adminController.verifyLogin)

admin_route.get('/home', adminAuth.isLogin, adminController.loadDashboard)

admin_route.get('/logout', adminAuth.isLogin, adminController.logout)

admin_route.get('/forget', adminController.forgetLoad)
admin_route.post('/forget', adminController.forgetVerify)

admin_route.get('/forget-password', adminController.forgetPasswordLoad)
admin_route.post('/forget-password', adminController.resetPassword)

admin_route.get('/allusers', adminAuth.isLogin, adminController.allUsers)

admin_route.get('/allproducts', adminAuth.isLogin, adminController.allproducts)

admin_route.get('/category', adminAuth.isLogin, adminController.category)

// admin_route.get('/order', adminAuth.isLogin, adminController.order)
admin_route.get('/orders', adminAuth.isLogin, adminController.order);
admin_route.post('/update-order-status',  adminController.orderstatus);
admin_route.get('/update-order-status',  adminController.getorderstatus);
// admin_route.get('*',function(req,res){
//     res.redirect('/admin')
// })



//addproduct

const productController = require('../controllers/productController')

admin_route.get('/addproduct', adminAuth.isLogin, productController.addproducts);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },

  filename: function (req, file, cb) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const name = formattedDate + '_' + file.originalname;
    cb(null, name);
  },

});
const upload = multer({ storage: storage });
//admin_route.post("/addproduct", upload.single('image'),productController.uploadProduct);
admin_route.post("/addproduct", upload.array('images', 5), productController.uploadProduct)


admin_route.post('/addproduct', adminAuth.isLogin, productController.uploadProduct);



const categoryController = require('../controllers/categoryController');

// category
admin_route.get('/category', adminAuth.isLogin, categoryController.category)

admin_route.get('/addcategory', adminAuth.isLogin, categoryController.addCategory)
admin_route.post('/addcategory', adminAuth.isLogin, categoryController.uploadCategory);

// admin_route.post('/categorystatus', adminAuth.isLogin, categoryController.categoryStatus)
admin_route.route('/categorystatus')
    .get(adminAuth.isLogin, categoryController.categoryStatus)
    .post(adminAuth.isLogin, categoryController.categoryStatus);




admin_route.get('/toggle-status/:userId', adminAuth.isLogin, adminController.toggleUserStatus);



//edit product
admin_route.get('/editproduct', productController.editproduct);
admin_route.post('/editproduct', upload.array('Images', 5), productController.updateproducts);
// admin_route.post('/editproduct',upload.array('Images',5),productController.updateproducts)

admin_route.get('/deleteproduct', adminAuth.isLogin, productController.deleteproduct);

//edit category
admin_route.get('/editcategory', adminAuth.isLogin, categoryController.editcategory);

admin_route.post('/editcategory', adminAuth.isLogin, categoryController.updatecategory)

admin_route.get('/deletecategory', adminAuth.isLogin, categoryController.deletecategory)

admin_route.get('/categorystatus', adminAuth.isLogin, categoryController.categoryStatus)




// sales report

admin_route.get('/salesreport',adminAuth.isLogin,adminController.salesReport)
admin_route.post('/salesreport',adminController.salesReport)
// Add this route in your express routes
//admin_route.post('/salesreport/download', adminController.salesReport);
admin_route.post('/salesreport/download',adminController.downloadSalesReport);



// offers
const offerController = require('../controllers/offerController')
admin_route.get('/offer',offerController.offer)

admin_route.get('/addoffer', offerController.addOffer)
admin_route.post('/addoffer', offerController.uploadOffer);


//edit offers
admin_route.get('/editoffer',offerController.editOffer)
admin_route.post('/editoffer/:id',offerController.updateOffer)





//coupons
const couponController = require('../controllers/couponController')
admin_route.get('/coupon',couponController.getCoupons)

admin_route.get('/addcoupon',couponController.addCoupon)
// admin_route.post('/addcoupon',couponController.uploadCoupon)
admin_route.post('/generatecoupon', couponController.generateCoupon);

admin_route.get('/editcoupon',couponController.editCoupon)
admin_route.post('/editcoupon/:id',couponController.updateCoupon)

admin_route.delete('/admin/coupon/:id', couponController.deleteCoupon);




module.exports = admin_route