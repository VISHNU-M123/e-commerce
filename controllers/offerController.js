const mongoose = require('mongoose');

const Offer = require('../models/offerModel')
const Product = require('../models/product')
const Category = require('../models/category')


//offer page
const offer = async (req,res) => {
    try {
        const offer = await Offer.find()
        res.render('offer',{offer})
    } catch (error) {
        console.log(error.message)
    }
}


//add offer page
const addOffer = async (req,res) => {
    try {
        res.render('addoffer')
    } catch (error) {
        console.log(error.message)
    }
}


// adding new offer 
const uploadOffer = async (req,res) => {
    try {
       const {name , discount , startDate , endDate , status} = req.body
       

       const numericDiscount = parseFloat(discount)
       const boolStatus = status === 'true'

       const offer = new Offer ({

        name,
        discount : numericDiscount,
        startDate,
        endDate,
        status : boolStatus

       })

       await offer.save()

        res.redirect('/admin/offer')

    } catch (error) {
        console.log(error.message)
    }
}


const editOffer = async (req,res) => {
    try {
        const offerId = req.query.id
        const offerData = await Offer.findById({_id : offerId})
        res.render('editoffer',{offer :offerData})
    } catch (error) {
        console.log(error.message)
    }
}



const updateOffer = async (req,res) => {
    try {
        
        const { name, discount, startDate, endDate } = req.body;
        const offerId = req.params.id;

        // Find the offer by ID
        const offer = await Offer.findById(offerId);

        // Update offer details
        offer.name = name;
        offer.discount = discount;
        offer.startDate = startDate;
        offer.endDate = endDate;

        // Save the updated offer
        await offer.save();

        // Redirect to the offer list page
        res.redirect('/admin/offer');
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    offer,
    addOffer,
    uploadOffer,
    editOffer,
    updateOffer
}