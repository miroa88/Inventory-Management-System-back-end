const User = require("../models/userSchema");
const { default: mongoose } = require("mongoose");
const HttpError = require('../models/httpError');
const { validationResult } = require('express-validator');

const getUsers = async (req, res, next) => {
    res.status(200).json({Users: "test"});
}

const registerUser =  async (req, res, next) => {

    const error = validationResult(req);
    if(!error.isEmpty()) {
        const error = new HttpError('Invalid inputs passed.', 422);
        return next(error);
    }

    const { name, email, password, photo, phone, bio } = req.body;


    const createdUser= new User({  
        name,
        email,
        password,
        photo,
        phone,
        bio
    });
   
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdUser.save({session});
        await session.commitTransaction();
    } catch(err) {
        const error = new HttpError('creating user failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({User: createdUser.toObject( {getters:true} )});
}

exports.registerUser = registerUser;
exports.getUsers = getUsers;