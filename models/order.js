const conn = require('../connection/db');

const Order = function(order){
    this.userId = order.userId,
    this.orderDate = order.orderDate,
    this.totalAmount = order.totalAmount,
    this.orderStatus = order.orderStatus
}

const OrderDetails = function (orderDetails){
    this.orderId = orderDetails.orderId,
    this.productId = orderDetails.productId,
    this.quantity = orderDetails.quantity,
    this.lineTotal = orderDetails.lineTotal

    //seller to be integrated
}

Order.create = (newOrder, result) => {
    conn.query(`INSERT INTO orders (user_id, order_date, total_amount, order_status)
    VALUES(?,?,?,?)`,
    [newOrder.userId, newOrder.orderDate, newOrder.totalAmount, newOrder.orderStatus],
    (err, res) => {
        if(err){
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }

        console.log("Inserted Order: ", {
            id: res.insertId, ...newOrder, message: 'Order added successfully'
        });
        result(null,{
            id: res.insertId
        });
    });
}

Order.deleteOrder = (id, result) => {
    conn.query(`UPDATE orders SET order_status = 'Failed' WHERE order_id = ?`, id,
    (err, res) => {
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;        
        }

        if(res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, {message: "Order updated successfully"});
    });
}

Order.payForOrder = (id, result) => {
    conn.query(`UPDATE orders SET order_status = 'Paid Succesffuly' WHERE order_id= ?`, id,
    (err, res) => {
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;        
        }

        if(res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, {message: "Order updated successfully"});
    });
}

OrderDetails.createOrderDetails = (newOrderDetails, result) => {
    conn.query(`INSERT INTO order_details (order_id, product_id, quantity, line_total) VALUES (?,?,?,?)`,
    [newOrderDetails.orderId, newOrderDetails.productId, newOrderDetails.quantity, newOrderDetails.lineTotal],
    (err, res) => {
        if(err){
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }

        result(null,{
            message: 'Order details created successfully'
        });
    });
}

module.exports = {
    Order,
    OrderDetails
}