const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const { check } = require('express-validator');

const router = express.Router();

router.get("/", appointmentController.getAppointmentById);
router.get("/:date", appointmentController.getAppointmentsByDate);

router.post("/new", 
    [
        check('duration').isInt(),
        check('name').trim().notEmpty(),
        check('phone').trim().notEmpty(),
        check('email').isEmail(),
        check('date').isISO8601()
    ],
    appointmentController.createAppointment);

router.patch("/update/:aid", 
[
    check('duration').isInt(),
    check('name').trim().notEmpty(),
    check('phone').trim().notEmpty(),
    check('email').isEmail(),
    check('date').isISO8601(),
    check('completed').isBoolean()
],
appointmentController.updateAppointmentById);

router.delete('/:aid', appointmentController.deleteAppointmentById);

module.exports = router;