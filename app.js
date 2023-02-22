const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const authRoute = require('./routes/auth.route')
require("dotenv").config();
require('./helpers/init_mongodb')
const {verifyAccessToken}= require('./helpers/jwt_helper')
require('./helpers/init_redis') 

const app = express();
app.use(morgan('dev'));
app.use(express.json()) //to parse the request body coming into json format
app.use(express.urlencoded({extended:true})); //if the client is use form urlencoded data 

const PORT = process.env.PORT || 9001; //port 

app.get('/',verifyAccessToken, async(req,res,next) => {          //protected home route
    console.log(req.headers['authorization'])

    res.send('Hello from express.')
});

//root route
app.use('/auth',authRoute);


//error handling
app.use(async (req,res,next) => {
    
    next(createError.NotFound()); //with the http-error package
});

app.use((err,req,res,next) => {
    res.status(err.status || 500) //500 internal server error
    res.send({
        error: {
            status:err.status || 500,
            message: err.message,
        }
    })
})


//server
app.listen(PORT, (req, res) => {
  console.log(`🚀server is running on port ${PORT} `);
});
