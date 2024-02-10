const conn = require('../connection/db');

const PetProfile = function(petProfile) {
    this.petName = petProfile.petName;
    this.petAge = petProfile.petAge;
    this.vaccinationDate = petProfile.vaccinationDate;
    this.petCategoryId = petProfile.petCategoryId;
    this.ownerId = petProfile.ownerId;
    this.petImage = petProfile.petImage
};

PetProfile.create = (newProfile, result) => {
    conn.query("INSERT INTO petprofiles (pet_name, pet_age, vaccination_date, petcategory_id, owner_id, pet_image) VALUES (?, ?, ?, ?, ?, ?)",
    [newProfile.petName, newProfile.petAge, newProfile.vaccinationDate, newProfile.petCategoryId, newProfile.ownerId, `pet_images/${newProfile.petImage}`], (err, res) => {
        if(err) {
            console.log(`Error: ${err}`);
            result(err, null);
            return;
        }
        console.log("Created Pet Profile: ", { id: res.insertId, ...newProfile });
        result(null, { id: res.insertId, ...newProfile });
    });
};

PetProfile.updateById = (id, petProfile, result) => {
    conn.query(
        "UPDATE petprofiles SET pet_name = ?, pet_age = ?, vaccination_date = ?, petcategory_id = ?, owner_id = ?, pet_image = ? WHERE pet_id = ?",
        [petProfile.petName, petProfile.petAge, petProfile.vaccinationDate, petProfile.petCategoryId, petProfile.ownerId, petProfile.petImage, id],
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
            result(null, { id: id, ...petProfile });
        }
    );
};

PetProfile.deleteById = (id, result) => {
    conn.query("DELETE FROM petprofiles WHERE pet_id = ?", id, (err, res) => {
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
        
        console.log("Deleted Pet Profile with id: ", id);
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
