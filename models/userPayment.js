const axios = require('axios');
const conn = require('../connection/db');
const { PAYMENT_SECRET_KEY } = process.env;

const UserPayment = function(userPayment) {
    this.userId = userPayment.userId,
    this.orderId = userPayment.orderId,
    this.grandTotal = userPayment.grandTotal
}

UserPayment.verifyPayment = (token, amount, callback) => {
    axios.post('https://khalti.com/api/v2/payment/verify/', {
        token: token,
        amount: amount
    }, {
        headers: {
            'Authorization': `Key ${PAYMENT_SECRET_KEY}`
        }
    }).then(response => {
        console.log(response.data);
        callback(null, response.data);
    }).catch(error => {
        console.error(error.response ? error.response.data : error);
        callback(error.response ? error.response.data : { message: error.message }, null);
    });
};

UserPayment.createPayment = (newPayment, token, result) => {
    UserPayment.verifyPayment(token, newPayment.grandTotal, (err, verificationResult) => {
        if (err) {
            console.error(`Payment Verification Error: ${err.message}`);
            return result(err, null);
        }

        conn.beginTransaction(err => {
            if (err) {
                throw err;
            }

            conn.query(`INSERT INTO userpayments (user_id, order_id, grand_total, payment_token) VALUES (?, ?, ?, ?)`, 
                       [newPayment.userId, newPayment.orderId, newPayment.grandTotal, token], 
                       (err, res) => {
                if (err) {
                    return conn.rollback(() => {
                        console.error(`Error: ${err}`);
                        result(err, null);
                    });
                }
                
                conn.query(`UPDATE orders SET order_status = 'Paid' WHERE order_id = ?`, [newPayment.orderId], (err, res) => {
                    if (err) {
                        return conn.rollback(() => {
                            console.error(`Error: ${err}`);
                            result(err, null);
                        });
                    }

                    conn.query(`UPDATE products p JOIN (SELECT product_id, quantity FROM orderdetails 
                                WHERE order_id = ? GROUP BY product_id) o 
                                ON p.product_id = o.product_id 
                                SET p.productstock_quantity = p.productstock_quantity - o.quantity 
                                WHERE p.product_id IN (SELECT product_id FROM orderdetails WHERE order_id = ?)`, 
                                [newPayment.orderId, newPayment.orderId], (err, res) => {
                        if (err) {
                            return conn.rollback(() => {
                                console.error(`Error: ${err}`);
                                result(err, null);
                            });
                        }
                            
                        conn.commit(err => {
                            if (err) {
                                return conn.rollback(() => {
                                    console.error(`Error: ${err}`);
                                    result(err, null);
                                });
                            }
                            console.log("User Payment inserted and order updated: ", { id: res.insertId, ...newPayment });
                            result(null, { message: "User Payment successful" });
                        });
                    });
                });
            });
        });
    });
};

UserPayment.getAllPaymentDetails = (result) => {
    const query = `
    SELECT up.*, u.user_name, o.order_date, o.total_amount, o.order_status 
    FROM userpayments up
    JOIN userprofiles u ON up.user_id = u.user_id
    JOIN orders o ON up.order_id = o.order_id;`;

    conn.query(query, (err, res) => {
        if (err) {
            console.error(`Error: ${err}`);
            result(err, null);
            return;
        }

        console.log("Retrieved all payment details successfully");
        result(null, res);
    });
};


module.exports = UserPayment;
