const conn = require('../connection/db');

const PetProfile = function(petProfile) {
    this.petName = petProfile.petName;
    this.petAge = petProfile.petAge;
    this.petCategoryId = petProfile.petCategoryId;
    this.ownerId = petProfile.ownerId;
    this.petImage = petProfile.petImage
};

PetProfile.create = (newProfile, result) => {
    conn.query("INSERT INTO petprofiles (pet_name, pet_age, petcategory_id, owner_id, pet_image) VALUES (?, ?, ?, ?, ?)",
    [newProfile.petName, newProfile.petAge, newProfile.petCategoryId, newProfile.ownerId, `pet_images/${newProfile.petImage}`], (err, res) => {
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        console.log("Created Pet Profile: ", { id: res.insertId, ...newProfile });
        result(null, { message: `Profile created for ${newProfile.petName}` });
    });
};

PetProfile.createPetHistory = (eventName, eventDescription, eventDate,  petId, result) => {
    conn.query("INSERT INTO pethistory (event_name, event_description, event_date, pet_id) VALUES (?,?,?,?)",
                [eventName,eventDescription,eventDate,petId], (err, res) => {
                    if(err) {
                        console.log(`Error: ${err}`);
                        result(err, null);
                        return;
                    }
                    result(null, { message: `History recorded!` });
                });
}

PetProfile.updateByIdWithImage = (id, petProfile, result) => {
    conn.query(
        "UPDATE petprofiles SET pet_age = ?, pet_image = ? WHERE pet_id = ?",
        [petProfile.petAge, `pet_images/${petProfile.petImage}`, id],
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
            
            console.log("Updated Pet Profile: ", { id: id, ...petProfile });
            result(null, { message: "Profile updated!" });
        }
    );
};

PetProfile.updateByIdWithoutImage = (id, petProfile, result) => {
    conn.query(
        "UPDATE petprofiles SET pet_age = ? WHERE pet_id = ?",
        [petProfile.petAge, id],
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
            
            console.log("Updated Pet Profile: ", { id: id, ...petProfile });
            result(null, { message: "Profile updated!" });
        }
    );
};

PetProfile.deleteByPetId = (id, result) => {
    conn.query("DELETE FROM pethistory WHERE pet_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error deleting pet history: ${err}`);
            result(err, null);
            return;
        }

        conn.query("DELETE FROM petprofiles WHERE pet_id = ?", id, (err, res) => {
            if (err) {
                console.log(`Error deleting pet profile: ${err}`);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("Deleted Pet Profile with id: ", id);
            result(null, res);
        });
    });
};

PetProfile.deleteHistoryById = (id, result) => {
        conn.query("DELETE FROM pethistory WHERE history_id = ?", id, (err, res) => {
            if (err) {
                console.log(`Error deleting pet history: ${err}`);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("Deleted Pet history with id: ", id);
            result(null, res);
        });
};



PetProfile.getById = (id, result) => {
    conn.query("SELECT * FROM petprofiles WHERE pet_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Found Pet Profile: ", res[0]);
            result(null, res[0]);
            return;
        }
        
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

PetProfile.getHistoryByPetId = (id, result) => {
    conn.query("SELECT * FROM pethistory WHERE pet_id = ?", id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Found Pet Records: ", res);
            result(null, res);
            return;
        }
        
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

PetProfile.getAllByOwnerId = (id, result) => {
    conn.query(`SELECT pp.pet_id, pp.pet_name, pp.pet_age, pp.petcategory_id, pp.owner_id, pp.pet_image, pp.created_at, pp.updated_at, pc.petcategory_name, 
                COUNT(ph.pet_id) as record_count FROM petprofiles pp
                JOIN petcategories pc ON pp.petcategory_id = pc.petcategory_id
                LEFT JOIN pethistory ph ON pp.pet_id = ph.pet_id
                WHERE pp.owner_id = ? 
                GROUP BY pp.pet_id, pp.pet_name, pp.pet_age, pp.petcategory_id, pp.owner_id, pp.pet_image, pp.created_at, pp.updated_at, pc.petcategory_name;`, 
                id, (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        
        if (res.length) {
            console.log("Found Pet Profile: ", res);
            result(null, res);
            return;
        }
        
        // No result for the given ID
        result({ kind: "not_found" }, null);
    });
};

PetProfile.getAll = (result) => {
    conn.query("SELECT * FROM petprofiles", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log("Pet Profiles: ", res);
        result(null, res);
    });
};

PetProfile.deleteAll = (result) => {
    conn.query("DELETE FROM petprofiles", (err, res) => {
        if (err) {
            console.log(`Error: ${err}`);
            result(null, err);
            return;
        }
        
        console.log(`Deleted ${res.affectedRows} pet profiles`);
        result(null, res);
    });
};

module.exports = PetProfile;
