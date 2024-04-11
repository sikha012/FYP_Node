const express = require('express');

const router = express.Router();

const path = require('path');

const orderController = require('../controllers/orderController');
const isAuth = require('../middleware/auth.js');

router.post('/createorder', isAuth, orderController.createNewOrder);
router.put('/order/cancel/:orderId', orderController.deleteOrder);
router.put('/order/pay/:orderId', orderController.payForOrder);
router.get('/orderdetails/deliver', orderController.getOrdersToDeliver);
router.put('/orderdetails/update', orderController.updateDeliveryStatusOfOrder);
router.get('/orderdetails/seller/:userId', orderController.getOrdersToDeliverByUserId);
router.get('/orderdetails/user/:userId', orderController.getOrdersToReceiveByUser);


module.exports = router;