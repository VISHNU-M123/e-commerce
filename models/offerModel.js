const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    // description : {
    //     type : String,
    //     required : true
    // },
    discount : {
        type : Number,
        required : true
    },
    startDate : {
        type : Date,
        required : true
    },
    endDate : {
        type : Date,
        required : true
    },
    status : {
        type : Boolean,
        default : true

    }
})

const Offer = mongoose.model('Offer',offerSchema)
module.exports = Offer