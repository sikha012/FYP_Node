const conn = require('../connection/db');

const Product = function(product) {
    this.name = product.name;
    this.price = product.price;
    this.stockQuantity = product.stockQuantity;
    this.description = product.description;
    this.image = product.image;
    this.petCategoryId = product.petCategoryId;
    this.productCategoryId = product.productCategoryId;
    this.productSellerId = product.productSellerId;
};

Product.create = (newProduct, result) => {
    conn.query(
        "INSERT INTO products (product_name, product_price, productstock_quantity, product_description, product_image, petcategory_id, productcategory_id, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
        [newProduct.name, newProduct.price, newProduct.stockQuantity, newProduct.description, `product_images/${newProduct.image}`, newProduct.petCategoryId, newProduct.productCategoryId, newProduct.productSellerId], 
        (err, res) => {
            if(err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            console.log("Created Product: ", { id: res.insertId, ...newProduct });
            result(null, {
                message: 'Product uploaded successfully'
            });
        }
    );
};

Product.updateById = (id, product, result) => {
    conn.query(
        `UPDATE products SET product_name = ?,
         product_price = ?, 
         productstock_quantity = ?, 
         product_description = ?, 
         product_image = ?, 
         petcategory_id = ?, 
         productcategory_id = ?, 
         seller_id = ? 
         WHERE product_id = ?`,
        [product.name, product.price, 
        product.stockQuantity, product.description, 
        `product_images/${product.image}`, 
        product.petCategoryId, product.productCategoryId, product.productSellerId, 
        id],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                // No rows affected means the ID didn't exist
                result({ kind: "not_found" }, null);
                return;
            }
            console.log("Updated Product: ", { id: id, ...product });
            result(null, { message: 'Product Updated Successfully'});
        }
    );
};

Product.deleteById = (id, result) => {
    conn.query("UPDATE products SET is_deleted = 1 WHERE product_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            // No rows found with that ID
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("Deleted Product with id: ", id);
        result(null, res);
    });
};

Product.getById = (id, result) => {
    conn.query("SELECT * FROM products WHERE product_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        if (res.length) {
            console.log("Found Product: ", res[0]);
            result(null, res[0]);
            return;
        }
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

Product.getAll = (result) => {
    conn.query("SELECT p.*, pe.petcategory_name, pd.productcategory_name, u.user_name AS seller_name, u.token as seller_token"
                +" FROM products p JOIN petcategories pe ON p.petcategory_id = pe.petcategory_id "
                +"JOIN productcategories pd ON p.productcategory_id = pd.productcategory_id "
                +"JOIN userprofiles u ON p.seller_id = u.user_id WHERE p.is_deleted = 0",
        (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        console.log("Products: ", res);
        result(null, res);
    });
};

Product.getAllForSeller = (id, result) => {
    conn.query("SELECT p.*, pe.petcategory_name, pd.productcategory_name, sl.user_name"
                +" FROM products p JOIN petcategories pe ON p.petcategory_id = pe.petcategory_id "
                +"JOIN productcategories pd ON p.productcategory_id = pd.productcategory_id "
                +"JOIN userprofiles sl ON p.seller_id = sl.user_id WHERE p.seller_id = ? AND p.is_deleted = 0", 
                id,
        (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        console.log("Products: ", res);
        result(null, res);
    });
};

Product.deleteAll = (result) => {
    conn.query("DELETE FROM products", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        console.log(`Deleted ${res.affectedRows} products`);
        result(null, res);
    });
};

module.exports = Product;