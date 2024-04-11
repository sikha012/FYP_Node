const UserPayment = require('../models/userPayment');
const sendNotification = require('../helpers/sendReminder');

exports.createPayment = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Payment data is missing!" });
    }

    if (!req.body.token) {
        return res.status(400).send({ message: "Payment verification token is missing!" });
    }

    const newPayment = new UserPayment({
        userId: req.user.id,
        orderId: req.body.orderId,
        grandTotal: req.body.grandTotal,
    });

    const sellerFCMs = req.body.sellerFCMs;
    let tokens;
    if(typeof sellerFCMs === 'string') {
        tokens = sellerFCMs.split(',');
    } else if (Array.isArray(sellerFCMs)) {
        tokens = sellerFCMs;
    }
    console.log(`Tokens from client: ${tokens}`);

    UserPayment.createPayment(newPayment, req.body.token, async (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating payment"
            });
        } else {
            tokens.forEach(async (token) => {
                try {
                    const notificationDate = new Date().toISOString();
                    await sendNotification.sendNotification(token, 
                        'Order Placed', `An order has been placed for your product`, {
                            type: "orderPlaced",
                            title: "Order Placed",
                            body: `An order has been placed for your product`,
                            notificationDate: notificationDate,
                            eventDate: new Date().toISOString()
                        });
                    console.log("Notification sent to token:", token);
                } catch (err) {
                    console.error(`Error occurred while sending notification to token ${token}:`, err);
                }
            });
    
            res.status(201).send(data);
        }
    });
};
