const User = require('../models/user.models');
const mongoose = require('mongoose');


//deprecated error
mongoose.set("strictQuery", false);

//mongodb connection
mongoose.connect(process.env.MONGODB_URI,
 {dbName: process.env.DB_NAME})
 .then(() => console.log('mongodb connected.'))
 .catch((err) => console.log(err))

 //connected event
 mongoose.connection.on('connected', () => {
    console.log("Mongoose connected to database.")
 });

 //error event
 mongoose.connection.on('error', (err) => {
    console.log(err.message);
 });

 //disconnection callback
 mongoose.connection.on('disconnected',() => {
    console.log("Mongoose connection is disconnected.")
 });

 //process event
 process.on('SIGINT',async() => {
    await mongoose.connection.close();
    process.exit(0)
 });

