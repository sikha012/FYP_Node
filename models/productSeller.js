const conn = require('../connection/db');

const ProductSeller = function(productSeller) {
    this.sellerName = productSeller.sellerName;
    this.sellerLocation = productSeller.sellerLocation;
    this.sellerContact = productSeller.sellerContact;
    this.sellerEmail = productSeller.sellerEmail;
};

ProductSeller.create = (newSeller, result) => {
    conn.query("SELECT * FROM productsellers WHERE seller_email = ?", [newSeller.sellerEmail], (err, res)=>{
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if(res && res.length > 0) {
            result({kind: 'already_exists'}, null);
            return;

        } else {
            conn.query("INSERT INTO productsellers (seller_name, seller_location, seller_contact, seller_email) VALUES (?, ?, ?, ?)", 
            [newSeller.sellerName, newSeller.sellerLocation, newSeller.sellerContact, newSeller.sellerEmail], (err, res) => {
                if(err){
                    console.log(`Error: ${err}`);
                    result(err, null);
                    return;
                    
                }
                console.log("Created Product Seller: ", {
                    id: res.insertId, ...newSeller
                });
                result(null, {
                    id: res.insertId, ...newSeller
                });
            });
        }
    });
};

ProductSeller.updateById = (id, productSeller, result) => {
    conn.query(
        "UPDATE productsellers SET seller_name = ?, seller_location = ?, seller_contact = ?, seller_email = ? WHERE seller_id = ?",
        [productSeller.sellerName, productSeller.sellerLocation, productSeller.sellerContact, productSeller.sellerEmail, id],
        (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            
            console.log("Updated Product Seller: ", { id: id, ...productSeller });
            result(null, { id: id, ...productSeller });
        }
    );
};

ProductSeller.deleteById = (id, result) => {
    conn.query("DELETE FROM productsellers WHERE seller_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        
        console.log("Deleted Product Seller with id: ", id);
        result(null, res);
    });
};

ProductSeller.getById = (id, result) => {
    conn.query("SELECT * FROM productsellers WHERE seller_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Found Product Seller: ", res[0]);
            result(null, res[0]);
            return;
        }
       
        result({ kind: "not_found" }, null);
    });
};

ProductSeller.getAll = (result) => {
    conn.query("SELECT * FROM productsellers", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log("Product Sellers: ", res);
        result(null, res);
    });
};

ProductSeller.deleteAll = (result) => {
    conn.query("DELETE FROM productsellers", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log(`Deleted ${res.affectedRows} product sellers`);
        result(null, res);
    });
};

module.exports = ProductSeller;
