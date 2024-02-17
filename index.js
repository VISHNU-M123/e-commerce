const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/E-commerce');

const express = require('express')
const app = express()
const path = require('path')
const crypto = require('crypto')
const nocache = require("nocache");
const session = require('express-session')
const bodyParser = require('body-parser')
const flash = require('connect-flash');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: crypto.randomBytes(64).toString('hex'), // Set a secret key for your session
  resave: false,
  saveUninitialized: true
}));

app.use(nocache());
app.use(flash());

const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

//for admin routes

const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});