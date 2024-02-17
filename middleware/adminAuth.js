const isLogin = async (req, res, next) => {
    try {
        console.log(req.session)
        if (!req.session.admin) {

            console.log("wwwwwwwww")
            res.redirect('/admin')
        } else {
            console.log("next islogin");
            next()
            console.log('next one');
        }
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.admin) {
            console.log("islogout step1")
            res.redirect('/admin/home')

        } else {
            console.log("next islogin");
            next()
        }

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin,
    isLogout
}