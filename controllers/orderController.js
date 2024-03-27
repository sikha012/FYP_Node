const {body} =require('express-validator');
const{Order,OrderDetails} = require('../models/order');

exports.createNewOrder = (req,res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Order  is missing!" });
    }
    console.log(req.body);
    console.log(req.body.userId);
    const newOrder = new Order({
        userId: req.body.userId,
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