const express = require('express');

const router = express.Router();

const path = require('path');

const orderController = require('../controllers/orderController');

router.post('/createorder', orderController.createNewOrder);
router.put('/order/cancel/:orderId', orderController.deleteOrder);
router.put('/order/pay/:orderId', orderController.payForOrder);
router.get('/orderdetails/seller/:userId', orderController.getOrdersToDeliverByUserId);


module.exports = router;