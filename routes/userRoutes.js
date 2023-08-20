const express = require("express");
const userController = require("../controllers/userController");
const { check } = require('express-validator');

const router = express.Router();

router.get("/", userController.getUsers);

router.post("/register", 
    [
        check('name').trim().notEmpty(),
        check('email').isEmail(),
        check('password').trim().notEmpty(),
    ],
    userController.registerUser);


module.exports = router;