const express = require('express');

const router = express.Router();

const path = require('path');

const {createPayment} = require('../controllers/userPaymentController');

router.post('/create-payment', createPayment);

module.exports = router;