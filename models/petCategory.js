const conn = require('../connection/db');

const PetCategory = function(petCategory) {
    this.petCategoryName = petCategory.petCategoryName;
};

PetCategory.create = (newCategory, result) => {

    conn.query("SELECT * FROM petcategories WHERE petcategory_name = ?", [newCategory.petCategoryName], (err, res)=>{
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if(res && res.length > 0) {
            result({kind: 'already_exists'}, null);
            return;
            
        } else {
            conn.query("INSERT INTO petcategories (petcategory_name) VALUES (?)", [newCategory.petCategoryName], (err, res) => {
                if(err){
                    console.log(`Error: ${err}`);
                    result(err, null);
                    return;
                }
                console.log("Created Pet Category: ", {
                    id: res.insertId, ...newCategory
                });
                result(null, {
                    id: res.insertId, ...newCategory
                });
            });
        }
    });
};

PetCategory.updateById = (id, petCategory, result) => {
    conn.query(
        "UPDATE petcategories SET petCategory_name = ? WHERE petcategory_id = ?",
        [petCategory.petCategoryName, id],
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
            
            console.log("Updated Pet Category: ", { id: id, ...petCategory });
            result(null, { id: id, ...petCategory });
        }
        );
    };
    
    PetCategory.deleteById = (id, result) => {
        conn.query("DELETE FROM petcategories WHERE petcategory_id = ?", id, (err, res) => {
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
            
            console.log("Deleted Pet Category with id: ", id);
            result(null, res);
        });
    };
    
    PetCategory.getById = (id, result) => {
        conn.query("SELECT * FROM petcategories WHERE petcategory_id = ?", id, (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(err, null);
                return;
            }
            
            if (res.length) {
                console.log("Found Pet Category: ", res[0]);
                result(null, res[0]);
                return;
            }
            
            // No result for the given ID
            result({ kind: "not_found" }, null);
        });
    };
    
    PetCategory.getAll = (result) => {
        conn.query("SELECT * FROM petcategories", (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(null, err);
                return;
            }
            
            console.log("Pet Categories: ", res);
            result(null, res);
        });
    };

    PetCategory.deleteAll = (result) => {
        conn.query("DELETE FROM petcategories", (err, res) => {
            if (err) {
                console.log(`Error: ${err}`);
                result(null, err);
                return;
            }
            
            console.log(`Deleted ${res.affectedRows} pet categories`);
            result(null, res);
        });
    };
    
    
module.exports = PetCategory;