const mongoose = require("mongoose");
const UniqueValidator = require("mongoose-unique-validator");

const appointmentSchema = mongoose.Schema(
    {
        date:{
            type: Date,
            required: true,
        },
        duration:{
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            required: true,
            default: false
        },    
    },
    {
        timestamps: true
    }
);

appointmentSchema.plugin(UniqueValidator);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;