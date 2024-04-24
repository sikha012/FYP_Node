const express = require('express');

const router = express.Router();

const path = require('path');

const paymentController = require('../controllers/userPaymentController');

const isAuth = require('../middleware/auth.js');

router.post('/create-payment', paymentController.createPayment);

router.get('/paymentDetails', paymentController.getAllPaymentDetails);

module.exports = router;