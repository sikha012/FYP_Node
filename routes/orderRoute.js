const express = require('express');

const router = express.Router();

const path = require('path');

const {createNewOrder, deleteOrder, payForOrder} = require('../controllers/orderController');

router.post('/createorder', createNewOrder);
router.put('/order/cancel/:orderId', deleteOrder);
router.put('/order/pay/:orderId', payForOrder);


module.exports = router;