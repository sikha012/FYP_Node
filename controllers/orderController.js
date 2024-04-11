const {body} =require('express-validator');
const{Order,OrderDetails} = require('../models/order');
const sendNotification = require('../helpers/sendReminder');

exports.createNewOrder = (req,res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order  is missing!" });
    }
    console.log(req.body);
    console.log(req.body.userId);
    console.log(req.user.id);
    const newOrder = new Order({
        userId: req.user.id,
        orderDate: new Date(),
        totalAmount: req.body.totalAmount,
        orderStatus: 'Pending'
    });

    Order.create(newOrder, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the order"
            });
        } else {
            const cartItems = req.body.cartItems;

            cartItems.forEach(item => {
                const newOrderDetails = new OrderDetails({
                    orderId: data.id,
                    productId: item.product.product_id,
                    quantity: item.quantity,
                    lineTotal: item.quantity * item.product.product_price
                });

                OrderDetails.createOrderDetails(newOrderDetails, (error, detailData) => {
                    if (error) {
                        console.log('Error adding order detail:', error);
                        res.status(500).send({
                            message: error.message || "Some error occurred while adding order details"
                        });
                        return;                        
                    }
                });
            });
            res.status(201).send({ "orderId": data.id, order: newOrder});
        }
    });
}

exports.getOrdersToDeliver = (req, res) => {

    OrderDetails.getOrdersToDeliver((error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No order details found to deliver.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving order details for orders to deliver.`
                });
            }
        }
        res.status(200).send(data);
    });
}

exports.updateDeliveryStatusOfOrder = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order Detail Id is missing!" });
    }

    const orderDetailId = req.body.orderDetailId;
    const status = req.body.status;
    const userFCM = req.body.userFCM;
    const productName = req.body.productName;

    OrderDetails.updateOrderStatus(status, orderDetailId, async (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No order details found with id ${orderDetailId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving order details with id ${orderDetailId}`
                });
            }
        } else {
            try{    
                await sendNotification.sendNotification(userFCM, 
                    'Delivery Status Changed', `Delivery status for ${productName} changed to ${status}`, {
                        type: "statusChanged",
                        title: "Product Delivery Status Changed",
                        body: `Delivery status for ${productName} changed to ${status}`,
                        notificationDate: new Date().toISOString(),
                        eventDate: new Date().toISOString()
                      });
                    console.log("Notification sent!");
            } catch (err) {
                console.log(`Error occured while sending notification: ${err}`);

            }
            return res.status(201).send(data);
        }

    });
};

exports.getOrdersToDeliverByUserId = (req, res) => {
    const userId = req.params.userId;

    OrderDetails.getOrdersToDeliverByUserId(userId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No order details found with user id ${userId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving order details for user id ${userId}`
                });
            }
        }
        res.status(200).send(data);
    });
}

exports.getOrdersToReceiveByUser = (req, res) => {
    const userId = req.params.userId;

    OrderDetails.getOrdersToReceiveByUser(userId, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                return res.status(404).send({
                    message: `No order details found for user id ${userId}.`
                });
            } else {
                return res.status(500).send({
                    message: `Error retrieving order details for user id ${userId}`
                });
            }
        }
        res.status(200).send(data);
    });
};


exports.deleteOrder = (req, res) => {
    const orderId = req.params.orderId;

    Order.deleteOrder(orderId, (error, result) => {
        if (error) {
            return res.status(500).send({
                message: error.message || "An error occurred while canceling the order."
            });
        }

        if (result.kind === "not_found") {
            return res.status(404).send({
                message: `Order not found with id ${orderId}.`
            });
        }

        return res.status(200).send({ message: "The order was canceled!" });
    });
    
};

exports.payForOrder = (req, res) => {
    const orderId = req.params.orderId;


    Order.payForOrder(orderId, (error, result) => {
        if (error) {
            return res.status(500).send({
                message: error.message || "An error occurred while updating the order status to paid."
            });
        }

        if (result.kind === "not_found") {
            return res.status(404).send({
                message: `Order not found with id ${orderId}.`
            });
        }

        return res.status(200).send({ message: "Order status updated to paid successfully!" });
    });
}