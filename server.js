const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config()
const HttpError = require("./models/httpError");
const appointmentRoutes = require("./routes/appointmentRoutes");
// const cors = require("cors");


const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    //the line bellow will be comment out after adding auth middleware
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

//middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));

// app.use(cors({
//     origin: ["http://localhost:3000"]
// }))

app.use("/api/appointments", appointmentRoutes);

//this middleware executes if we do not get a response.
app.use((req, res, next) => {
    const error = new HttpError("Could not find this route. ", 404);
    return next(error);
});

//this middleware executes if the request contains error.
app.use((error, req, res, next) => {   
    if (res.headerSent) {
      return next(error);
    }
    res
      .status(error.code || 500)
      .json({ message: error.message || "An unknown err happened!!" }); // 
});

const PORT = process.env.PORT || 5000

mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGO_URI)
    .then( app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
    }))
    .catch(err => console.log("Error", err))