const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')


//register
router.post('/register',authController.register);

//login
router.post('/login', authController.login);

//refresh token
router.post('/refresh-token', authController.refreshToken);

//logout
router.delete('/logout', authController.logout);

module.exports = router;