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
    conn.query(`UPDATE orders SET order_status = 'Paid Succesfully' WHERE order_id= ?`, id,
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
    conn.query(`INSERT INTO orderdetails (order_id, product_id, quantity, line_total) VALUES (?,?,?,?)`,
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

OrderDetails.getOrdersToDeliverByUserId = (userId, result) => {
    conn.query(`SELECT OD.*, O.user_id, O.order_date, O.total_amount, U.token, U.user_name, U.user_contact, U.user_location, P.product_name, P.product_image 
    FROM orderdetails OD JOIN orders O ON OD.order_id = O.order_id 
    JOIN userprofiles U ON O.user_id = U.user_id 
    JOIN products P ON OD.product_id = P.product_id 
    WHERE P.seller_id = ? AND O.order_status = 'Paid';`, 
    userId, 
    (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("Order Details: ", res);
            result(null, res);
            return;
        }

        result({ kind: "not_found" }, null);
    });
}

OrderDetails.getOrdersToReceiveByUser = (userId, result) => {
    conn.query(`SELECT OD.*, O.user_id, O.order_date, O.total_amount,
                S.token, S.user_name, S.user_contact, S.user_location,
                P.product_name, P.product_image
            FROM orderdetails OD 
            JOIN orders O ON OD.order_id = O.order_id
            JOIN products P ON OD.product_id = P.product_id
            JOIN userprofiles U ON O.user_id = U.user_id
            JOIN userprofiles S ON P.seller_id = S.user_id
            WHERE O.user_id = 53 AND O.order_status = 'Paid';`, 
    userId, 
    (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("Order Details: ", res);
            result(null, res);
            return;
        }

        result({ kind: "not_found" }, null);
    });
}

OrderDetails.getOrdersToDeliver = (result) => {
    conn.query(`SELECT OD.*, O.user_id, O.order_date, O.total_amount, U.user_name, U.token, U.user_contact, U.user_location, P.product_name, P.product_image 
    FROM orderdetails OD JOIN orders O ON OD.order_id = O.order_id 
    JOIN userprofiles U ON O.user_id = U.user_id 
    JOIN products P ON OD.product_id = P.product_id 
    WHERE O.order_status = 'Paid' AND (OD.status = 'Shipped' OR OD.status = 'On the way' OR OD.status = 'Delivered');`, 
    (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("Order Details: ", res);
            result(null, res);
            return;
        }

        result({ kind: "not_found" }, null);
    });
}

OrderDetails.updateOrderStatus = (status, orderDetailId, result) => {
    conn.query("UPDATE orderdetails SET status = ? WHERE orderdetail_id = ?", 
        [status, orderDetailId], 
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

            result(null, {message: "Order Details updated Successfully"});
    });
}

module.exports = {
    Order,
    OrderDetails
}