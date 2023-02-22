const createError = require('http-errors');
const User = require('../models/user.models');
const {authSchema} = require('../helpers/validationSchema');
const{signAccessToken, signRefreshToken, verifyRefreshToken} = require('../helpers/jwt_helper');
const { verify } = require('jsonwebtoken');
const client = require('../helpers/init_redis')


module.exports = {

    //register controller
    register: async(req,res,next) => {
        try {
          
            const result = await authSchema.validateAsync(req.body)    //this validation with JOI
    
            //is user exist or not
            const doesExist =  await User.findOne({ email: result.email });
            if(doesExist)throw createError.Conflict(`${result.email} email is already been registered`);
            //save register a new user
            const user = new User(result);
            const savedUser = await user.save();
            const accessToken = await signAccessToken(savedUser.id) // send access token 
            const refreshToken = await signRefreshToken(savedUser.id) // send refresh token
            
            res.send({accessToken, refreshToken});  //save new user
    
        } catch (error) {
            if (error.isJoi === true)error.status = 422
            next(error) // this error handle from middleware which is created in main app.js file
        }
    },

    //login controller
    login:async(req,res,next) => {
        try {
            
            const result = await authSchema.validateAsync(req.body) 
            const user = await User.findOne({email: result.email})
            //is user exist
            if(!user) throw createError.NotFound("User is not registered");
    
            //compare the password
            const isMatch = await user.isValidPassword(result.password); //if not match
            if(!isMatch) throw createError.Unauthorized("Email/password not valid"); //send error
    
            const accessToken = await signAccessToken(user.id) //send access token
            const refreshToken = await signRefreshToken(user.id) //send refresh token
    
            res.send({accessToken, refreshToken });
    
        } catch (error) {
    
            if(error.isJoi === true) 
            return next(createError.BadRequest("Invalid Email/Password"))
            next(error)
        }
    },

    //refresh token controller
    refreshToken: async(req,res,next) => {
    
        try {
            const { refreshToken } = req.body
            if(!refreshToken) throw createError.BadRequest();
    
            const userId = await verifyRefreshToken(refreshToken);
    
            const accessToken = await signAccessToken(userId);
            const refToken = await signRefreshToken(userId);
    
            res.send({ accessToken: accessToken, refreshTokens: refToken})
    
        } catch (error) {
            next(error)
        }
    
    },

    //logout controller
    logout: async(req,res,next) => {
        try {
            
            const{refreshToken} = req.body
            if(!refreshToken) throw createError.BadRequest();
    
            const userId = await verifyRefreshToken(refreshToken);
    
            client.DEL(userId, (err, value) => {
                if(err){
                    console.log(err.message);
                    throw createError.InternalServerError();
                }
    
                console.log(value);
                res.sendStatus(204)
            })
        } catch (error) {
            next(error)
        }
    }
}