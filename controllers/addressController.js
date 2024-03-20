const mongoose = require('mongoose');
const Address = require('../models/addressModel');



// In addressController.js
const handleGenericAddress = (req, res) => {
    res.status(400).json({ message: 'Bad Request: Missing user or address ID' });
};




// // Add a new address for a user
// const addAddress = async (req, res) => {
//     try {

    
//         console.log(req.session.user_id,'userid in the addd adress');

//         const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;
        
//         // Assuming `userId` is available in your route or session
//         //const userId = mongoose.Types.ObjectId(req.params.userId); // Convert userId to ObjectId

//         const newAddress = new Address({
//             userId: req.session.user_id,
//             address:[{
//                 name,
//                 phone,
//                 pincode,
//                 email,
//                 streetAddress,
//                 city,
//                 state,
//                 landmark,
//                 phone2
//             }]
           
//         });

//         await newAddress.save();

//         console.log('saved new address', newAddress);
//        // res.status(201).json({ message: 'Address added successfully', address: newAddress });
//     } catch (error) {
//         console.error('Error adding address:', error);
//         console.log('address not saved');
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };







const addAddress = async (req, res) => {
    try {
        console.log('entering hereeee');
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;

        // Find the user's address based on userId
        const existingAddress = await Address.findOne({ userId: req.session.user_id });

        // If there is an existing address, add the new address to the array
        if (existingAddress) {
            existingAddress.address.push({
                name,
                phone,
                pincode,
                email,
                streetAddress,
                city,
                state,
                landmark,
                phone2
            });

            await existingAddress.save();
            res.redirect('profile')
           // res.status(201).json({ message: 'Address added successfully', address: existingAddress });
        } else {
            // If no existing address, create a new one
            const newAddress = new Address({
                userId: req.session.user_id,
                address: [{
                    name,
                    phone,
                    pincode,
                    email,
                    streetAddress,
                    city,
                    state,
                    landmark,
                    phone2
                }]
            });

            await newAddress.save();
            res.redirect('profile')
           // res.status(201).json({ message: 'Address added successfully', address: newAddress });
        }
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const adAddress = async (req, res) => {
    try {
        console.log('entering hereeee');
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.query;

        // Find the user's address based on userId
        const existingAddress = await Address.findOne({ userId: req.session.user_id });

        // If there is an existing address, add the new address to the array
        if (existingAddress) {
            existingAddress.address.push({
                name,
                phone,
                pincode,
                email,
                streetAddress,
                city,
                state,
                landmark,
                phone2
            });

            await existingAddress.save();
            res.redirect('profile')
           // res.status(201).json({ message: 'Address added successfully', address: existingAddress });
        } else {
            // If no existing address, create a new one
            const newAddress = new Address({
                userId: req.session.user_id,
                address: [{
                    name,
                    phone,
                    pincode,
                    email,
                    streetAddress,
                    city,
                    state,
                    landmark,
                    phone2
                }]
            });

            await newAddress.save();
            res.redirect('profile')
           // res.status(201).json({ message: 'Address added successfully', address: newAddress });
        }
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




const editAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        console.log('Received addressId:', addressId);
        const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;

        // Create an object with the fields you want to update
        const updatedFields = {
            name,
            phone,
            pincode,
            email,
            streetAddress,
            city,
            state,
            landmark,
            phone2
            // Add other fields as needed
        };

        // Find the address by ID and update the specified fields
        const address = await Address.findOneAndUpdate(
            { "address._id": addressId }, // Match the specific address within the array
            { $set: { "address.$": updatedFields } }, // Update the matched address
            { new: true }
        );

        console.log('updated address:', address);

        if (!address) {
            console.log('Address not found for ID:', addressId);
            return res.status(404).json({ message: 'Address not found' });
        }
          res.redirect('/profile')
       // res.status(200).json({ message: 'Address updated successfully', address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};






// Edit an existing address
// const editAddress = async (req, res) => {
//     try {
//         const { addressId } = req.params;
//         console.log('Received addressId:', addressId);
//         // Assuming your form fields are named as in the provided HTML form
//         const { name, phone, pincode, email, streetAddress, city, state, landmark, phone2 } = req.body;

//         // Create an object with the fields you want to update
//         const updatedFields = {
//             name,
//             phone,
//             pincode,
//             email,
//             streetAddress,
//             city,
//             state,
//             landmark,
//             phone2
//             // Add other fields as needed
//         };

//         // Find the address by ID and update the specified fields


//         const address = await Address.findByIdAndUpdate(addressId, { $set: { address: updatedFields } });
//         console.log('updated address ',address)
//         // const address = await Address.findByIdAndUpdate(addressId, updatedFields, { new: true });

//         if (!address) {
//             console.log('Address not found for ID:', addressId);
//             return res.status(404).json({ message: 'Address not found' });
//         }

//         res.status(200).json({ message: 'Address updated successfully', address });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };





// Delete an address
const deleteAddress=async(req,res)=>{
    try {
        console.log('reached deelte address');
        const userId=req.session.user_id 
        const addressId=req.params.addressId
        console.log(addressId,'address Id in delete address');
        await Address.updateOne({userId},{$pull:{address:{_id:addressId}}})
        res.json({status:true})
        // res.redirect('/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {

     addAddress, 
     editAddress, 
     deleteAddress,
     handleGenericAddress,


     adAddress

};