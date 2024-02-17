const User = require('../models/userModel');

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {

            next()
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message + 'is login')
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home');
        } else {

            next();
        }
    } catch (error) {
        console.log(error.message + 'is logout')
    }
}

//authenticated user
const isAuthenticated = async (req, res, next) => {
    try {
        if (req.session && req.session.user_id) {
            res.locals.userAuthenticated = true;
            return next()
        } else {
            res.locals.userAuthenticated = false;
            return next()
        }
    } catch (error) {
        console.log(error.message)
    }
}


//blocking the user
const isBlocked = async (req, res, next) => {
    try {
        // Check if the user is logged in
        if (req.session && req.session.user_id) {
            const userId = req.session.user_id._id;

            // Fetch the user data from the database
            const userData = await User.findById(userId);

            // Check if the user is blocked by the admin
            if (userData && userData.Status === 'blocked') {
               
                 // Destroy the session
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                    // Redirect to home page if blocked
                    return res.redirect('/');
                });

               return ;
                // Redirect to home page if blocked

                //return res.redirect('/home');
            }
        }
        // If the user is not blocked, proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};




module.exports = {
    isLogin,
    // notLogged,
    isLogout,
    isAuthenticated,
    isBlocked
    
}