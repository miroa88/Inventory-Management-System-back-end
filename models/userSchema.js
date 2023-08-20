const mongoose = require("mongoose");
const UniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"]
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            trim: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please enter a valid email"
            ]
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minLength: [8, "Password must be up to 6 characters"],
            maxLength: [23, "Password must not be more than 23 characters"]
        },   
        photo: {
            type: String,
            default: "https://firebasestorage.googleapis.com/v0/b/laura-corset-shop.appspot.com/o/2289_SkVNQSBGQU1PIDEwMjgtMTE1.jpg?alt=media&token=a3d122cb-220a-4f0c-bea6-e11f2c0945c0"
        },  
        phone: {
            type: String,
            default: "+234"
        },
        bio: {
            type: String,
            maxLength: [250, "Password must not be more than 23 characters"],
            default: "bio"
        },
    },
    {
        timestamps: true
    }
);

userSchema.plugin(UniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;