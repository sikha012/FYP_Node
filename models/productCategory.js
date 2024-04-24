const conn = require('../connection/db');

const ProductCategory = function(productCategory) {
    this.productCategoryName = productCategory.productCategoryName;
};

ProductCategory.create = (newCategory, result) => {

    conn.query("SELECT * FROM productcategories WHERE productcategory_name = ?", [newCategory.productCategoryName], (err, res)=>{
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if(res && res.length > 0) {
            result({kind: 'already_exists'}, null);
            return;
            
        } else {
            conn.query("INSERT INTO productcategories (productcategory_name) VALUES (?)", [newCategory.productCategoryName], (err, res) => {
                if(err){
                    console.log(`Error: ${err}`);
                    result(err, null);
                    return;
                }
                console.log("Created Product Category: ", {
                    id: res.insertId, ...newCategory
                });
                result(null, {
                    id: res.insertId, ...newCategory
                });
            });
        }
    });
};

ProductCategory.updateById = (id, productCategory, result) => {
    conn.query(
        "UPDATE productcategories SET productcategory_name = ? WHERE productcategory_id = ?",
        [productCategory.productCategoryName, id],
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
            
            console.log("Updated Product Category: ", { id: id, ...productCategory });
            result(null, { id: id, ...productCategory });
        }
        );
    };
    
    ProductCategory.deleteById = (id, result) => {
        conn.query("DELETE FROM productcategories WHERE productcategory_id = ?", id, (err, res) => {
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
            
            console.log("Deleted Product Category with id: ", id);
            result(null, res);
        });
    };
    
    ProductCategory.getById = (id, result) => {
        conn.query("SELECT * FROM productcategories WHERE productcategory_id = ?", id, (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            
            if (res.length) {
                console.log("Found Product Category: ", res[0]);
                result(null, res[0]);
                return;
            }
            
      
            result({ kind: "not_found" }, null);
        });
    };
    
    ProductCategory.getAll = (result) => {
        conn.query("SELECT * FROM productcategories", (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(null, err);
                return;
            }
            
            console.log("Product Categories: ", res);
            result(null, res);
        });
    };

    ProductCategory.deleteAll = (result) => {
        conn.query("DELETE FROM productcategories", (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(null, err);
                return;
            }
            
            console.log(`Deleted ${res.affectedRows} product categories`);
            result(null, res);
        });
    };
    
    
module.exports = ProductCategory;