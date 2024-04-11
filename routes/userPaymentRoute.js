const express = require('express');

const router = express.Router();

const path = require('path');

const {createPayment} = require('../controllers/userPaymentController');

const isAuth = require('../middleware/auth.js');

router.post('/create-payment', isAuth, createPayment);

module.exports = router;