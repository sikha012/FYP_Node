const UserPayment = require('../models/userPayment');

exports.createPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Payment data is missing!" });
    }

    if (!req.body.token) {
        return res.status(400).send({ message: "Payment verification token is missing!" });
    }

    const newPayment = new UserPayment({
        userId: req.body.userId,
        orderId: req.body.orderId,
        grandTotal: req.body.grandTotal,
    });

    UserPayment.createPayment(newPayment, req.body.token, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating payment"
            });
        } else {
            res.status(201).send(data);
        }
    });
};
