
const Appointment = require("../models/appointmentModel");
const { default: mongoose } = require("mongoose");
const HttpError = require('../models/httpError');
const { validationResult } = require('express-validator');
const moment = require('moment');
//https://momentjs.com/timezone/docs/

const getAppointmentById =  async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({msg: err.message});
    }
}

const getAppointmentsByDate =  async (req, res) => {
    const date = req.params.date;

    const startOfMonth = moment(date).startOf('month').format();
    const endOfMonth = moment(date).endOf('month').format();

    let bookedAppointments;
    try {
        bookedAppointments = await Appointment.find({ date: { $gte: startOfMonth, $lte: endOfMonth }}).sort({ date: 1 });
        res.status(200).json(bookedAppointments);
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find an appointment', 500);
        return next(error);
    }
}

const createAppointment =  async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const error = new HttpError('Invalid inputs passed.', 422);
        return next(error);
    }

    const { duration, name, phone, email, date } = req.body;

    // in order to get todays appointment, I used find query 
    // filtering all appointment between yesterday and tomorrow

    const nextDay = moment(date).add(1, 'days').format();
    const dayBefore = moment(date).subtract(1, 'days').format();

    let bookedAppointments;

    try {
        bookedAppointments = await Appointment.find({ date: { $gte: dayBefore, $lte: nextDay }}).sort({ date: 1 })
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find an appointment', 500);
        return next(error);
    }

    // filtering bookedAppointments to find overlaps using the logic bellow
    let isOverlapped = bookedAppointments.filter(appointment => {
        return(   
            //(EndA > StartB) and (StartA < EndB)  
            moment(appointment.date).add(appointment.duration, 'minutes').toDate() > moment(date).toDate() &&
            appointment.date < moment(date).add(duration, 'minutes').toDate()
        )
    })
    
    //if overlapped exists, should return an error message
    if (isOverlapped.length) {
        const error = new HttpError('Overlapped found with existing appointment.', 400);
        return next(error);
    }

    const createdAppointment= new Appointment({  
        date : moment(date).toDate(),
        duration,
        name,
        phone,
        email
    });
   
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdAppointment.save({session});
        await session.commitTransaction();
    } catch(err) {
        const error = new HttpError('creating appointment failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({Appointment: createdAppointment.toObject( {getters:true} )});
}


const updateAppointmentById = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const error = new HttpError('Invalid inputs passed.', 422);
        return next(error);
    }

    const appointmentId = req.params.aid;
    const { duration, name, phone, email, date, completed } = req.body;

    let updatedAppointment;
    try {
        updatedAppointment = await Appointment.findById(appointmentId)
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find an appointment', 500);
        return next(error);
    }

    updatedAppointment.name = name;
    updatedAppointment.phone = phone;
    updatedAppointment.email = email; 
    updatedAppointment.completed = completed;
    updatedAppointment.duration = duration;
    updatedAppointment.date = moment(date).toDate();

    const nextDay = moment(date).add(1, 'days').format();
    const dayBefore = moment(date).subtract(1, 'days').format();

    let bookedAppointments;

    try {
        bookedAppointments = await Appointment.find({ date: { $gte: dayBefore, $lte: nextDay }}).sort({ date: 1 })
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find an appointment', 500);
        return next(error);
    }

    // filtering bookedAppointments to find overlaps using the logic bellow
    let isOverlapped = bookedAppointments.filter(appointment => {    
        return(   
            //(EndA > StartB) and (StartA < EndB)  
            moment(appointment.date).add(appointment.duration, 'minutes').toDate() > moment(date).toDate() &&
            appointment.date < moment(date).add(duration, 'minutes').toDate() &&
            appointment.id !== appointmentId
        )
    })
    // if overlapped exists, should return an error message
    if (isOverlapped.length) {
        const error = new HttpError('Cannot Update. Overlapped found with existing appointment.', 400);
        return next(error);
    }
    
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await updatedAppointment.save({session});
        await session.commitTransaction();
    } catch(err) {
        const error = new HttpError('Updating appointment failed, please try again.', 500);
        return next(error);
    }

    res.status(200).json({appointment: updatedAppointment.toObject({ getters:true })});
}

const deleteAppointmentById = async (req, res, next) => {
    const appointmentId = req.params.aid;

    let appointment;
    try {
        appointment = await Appointment.findById(appointmentId)
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not find an appointment', 500);
        return next(error);
    }

    if(!appointment){
        const error = new HttpError("Could not find appointment for this id.", 404);
        return next(error);
    }
  
    try {
      await appointment.remove();
    } catch (err) {
      const error = new HttpError("Something went wrong, could not delete appointment.", 500);
      return next(error);
    }
  
    res.status(200).json({ message: "appointment Deleted." });
};

exports.getAppointmentById = getAppointmentById;
exports.createAppointment = createAppointment;
exports.getAppointmentsByDate = getAppointmentsByDate;
exports.updateAppointmentById = updateAppointmentById;
exports.deleteAppointmentById = deleteAppointmentById;