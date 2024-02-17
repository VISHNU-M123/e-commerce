const Product = require('../models/product')


const multer = require('multer')
const path = require('path')
const express = require('express')
const app = express()
const fs = require('fs')
const sharp = require('sharp')
const { resourceLimits } = require('worker_threads')
const Category = require('../models/category')
const { category } = require('./adminController')



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(upload.array('image', 5));

// add product page
const addproducts = async (req, res) => {
  try {
    const category = await Category.find()
    res.render('addproduct', { category })
  } catch (error) {
    console.log(error.message)
  }
}


// add the product
const uploadProduct = async (req, res) => {
  try {
      // Extract the uploaded images
      const images = req.files.map(file => file.filename);

      const { Name, Description, Price, OfferPrice, Category, Status, Quantity, CroppedImageData } = req.body;
      const croppedImageData = JSON.parse(req.body.croppedImageData || '{}');

      const product = new Product({
              Name,
              Description,
              Price,
              OfferPrice,
              Category,
              Status,
              Quantity,
              Images: images,
              CroppedImageData:CroppedImageData || {}
        
            })

     
      await product.save();

      const promises = images.map(async (image) => {
          const originalImagePath = path.join(__dirname, '../public/uploads', image);
          const resizedPath = path.join(__dirname, '../public/uploads', 'resized_' + image);

          await sharp(originalImagePath)
          .extract({
            left:croppedImageData.x,
            top:croppedImageData.y,
            width:croppedImageData.width,
            height:croppedImageData.height
          })
              .resize(800, 1200, { fit: 'fill' })
              .toFile(resizedPath);
      });

      await Promise.all(promises);

      // res.status(200).send("Product added successfully");
      res.redirect("/admin/allproducts")
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};



//edit product page
const editproduct = async (req, res) => {
  try {

    const productId = req.query.id;
    const productData = await Product.findById({ _id: productId });
    const categoryData = await Category.findOne({ _id: productData.Category });

    
    res.render('editproduct', { product: productData, category: categoryData });

  } catch (error) {
    console.log(error.message);

  }
};

//updating the product
const updateproducts = async (req, res) => {
  try {
    // Fetch existing product data from the database
    const productId = req.body.product_id;
    const existingProduct = await Product.findById(productId).populate('Category');

    // Fetch category ID based on category name

    // const category = await Category.findOne({ Name: req.body.Category });
    // const Cname = category._id;

    // Process uploaded images
    const Images = req.files ? req.files.map(file => file.filename) : [];

    const deleteImageIndexes = req.body.deleteImage;
       if (deleteImageIndexes && deleteImageIndexes.length > 0) {
         // Remove images at the specified indexes
         deleteImageIndexes.forEach(index => {
           existingProduct.Images.splice(index, 1);
         });
       }

    if (Images.length > 0) {
      const updatedImages = [];

      for (let i = 0; i < Images.length; i++) {
        const originalImagePath = path.join(__dirname, '../public/uploads', Images[i]);
        const resizedPath = path.join(__dirname, '../public/uploads', `resized_${Images[i]}`);

        // Resize image using sharp
        await sharp(originalImagePath)
          .resize(800, 1200, { fit: 'fill' })
          .toFile(resizedPath);

        // Push the resized filename to the array
        updatedImages.push(`resized_${Images[i]}`);
      }

      // Update only the Images field in the existing product
      //existingProduct.Images = updatedImages;

      existingProduct.Images = existingProduct.Images.concat(updatedImages);


    }

    // Update other fields in the product (Name, Description, Price, etc.)
    existingProduct.Name = req.body.Name;
    existingProduct.Description = req.body.Description;
    existingProduct.Price = req.body.Price;
    existingProduct.OfferPrice = req.body.OfferPrice;
    //existingProduct.Category = Cname;
    existingProduct.Category.Name = req.body.Category;
    await existingProduct.Category.save();
    existingProduct.Status = req.body.Status;
    existingProduct.Quantity = req.body.Quantity;

    // Save the updated product
    const productData = await existingProduct.save();

    console.log('product data', productData);

    res.redirect('allproducts');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};




//deleting the product
const deleteproduct = async (req, res) => {
  try {
    const id = req.query.id;
    await Product.deleteOne({ _id: id });
    res.redirect('allproducts');

  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  uploadProduct,
  addproducts,
  editproduct,
  updateproducts,
  deleteproduct

}