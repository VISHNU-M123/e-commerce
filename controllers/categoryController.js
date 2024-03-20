const Category = require('../models/category');


//add category page
const addCategory = async (req, res) => {
  try {
    res.render('addcategory')
  } catch (error) {
    console.log(error.message)
  }
}

//uploading the category
const uploadCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ Name: { $regex: new RegExp("^" + name + "$", "i") } });

    // if (existingCategory) {
    //   return res.status(400).send('Category already exists');
    // }


    if (existingCategory) {
      // Redirect to add category page with a query parameter indicating the error
      return res.redirect("/admin/addCategory?error=CategoryAlreadyExists");
    }



    // Create a new category instance
    const category = new Category({
      Name: req.body.name,
      Description: req.body.description,

    });

    // Save the category to the database
    await category.save();

    return res.redirect("/admin/category")
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//category page
const category = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('category', { categories })
  } catch (error) {
    console.log(error.message)
  }
}

//category status
// const categoryStatus = async (req, res) => {
//   try {
//     const categoryId = req.query.categoryId; // Assuming userId is passed in the route params
//     console.log('asdfasdf', categoryId)
//     const category = await Category.findById(categoryId);

//     if (category) {
//       // Toggle the user status
//       const newStatus = category.Status === 'blocked' ? 'active' : 'blocked';
//       await category.updateOne({ _id: categoryId }, { $set: { Status: newStatus }, new: true })


//       res.redirect('/admin/category'); // Redirect to the user list page
//     } else {
//       res.redirect('/admin/category').status(404).send('category not found');
//     }

//   } catch (error) {
//     console.log(error.message)
//   }
// }



const categoryStatus = async (req, res) => {
  try {
      const categoryId = req.body.categoryId || req.query.categoryId; // Retrieve category ID from the form submission or query parameters
      const category = await Category.findById(categoryId);

      if (category) {
          // Toggle the category status
          const newStatus = category.Status === 'blocked' ? 'active' : 'blocked';
          await Category.updateOne({ _id: categoryId }, { $set: { Status: newStatus } });

          res.redirect('/admin/category'); // Redirect to the category list page
      } else {
          res.redirect('/admin/category').status(404).send('Category not found');
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

//deleting the category
const deletecategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    res.redirect('category');

  } catch (error) {
    console.log(error.message);
  }
}

//edit category page
const editcategory = async (req, res) => {
  try {
    const message = req.flash('message');
    const categoryId = req.query.id;
    const categoryData = await Category.findById({ _id: categoryId });
    res.render('editcategory', { category: categoryData, message });
  } catch (error) {
    console.log(error.message);
  }
};



//updating the category
const updatecategory = async (req, res) => {
  try {
    const { c_id, cname, c_desc } = req.body

    console.log('received form data', req.body)



    const CategoryAlreadyExists = await Category.findOne({ Name: cname });

    if (CategoryAlreadyExists && CategoryAlreadyExists._id.toString() !== c_id) {
      // If the category already exists and it's not the same category being edited
      console.log("Category already exists");
      // return res.status(400).json({ message: "Category already exists" });

      return res.send(
        "<script>alert('Category already exists'); window.location='/admin/category';</script>"
      );

      // return res.send(
      //   "<script>Swal.fire({ icon: 'error', title: 'Oops...', text: 'Category already exists!' }).then(() => { window.location='/admin/category'; });</script>"
      // );



    }




    const existingCategory = await Category.findOne({ _id: c_id })


    if (existingCategory) {
      const UpdateCategory = await Category.updateOne({ _id: c_id }, {
        $set: {
          Name: cname,
          Description: c_desc
        }
      })


      console.log('update category result ', UpdateCategory)


      if (UpdateCategory) {
        res.redirect('/admin/category')
      }
      else {
        res.redirect('/admin/category')
      }

    } else {
      console.log("Category is not found");
    }
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = {

  uploadCategory,
  addCategory,
  category,
  categoryStatus,
  deletecategory,
  editcategory,
  updatecategory
};