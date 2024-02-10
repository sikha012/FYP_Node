const PetProfile = require('../models/petProfile');

exports.createPetProfile = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Pet profile data is missing!" });
    }

    // Create a new pet profile object with or without an image path
    const newPetProfile = new PetProfile({
        petName: req.body.petName,
        petAge: req.body.petAge,
        vaccinationDate: req.body.vaccinationDate,
        petCategoryId: req.body.petCategoryId,
        ownerId: req.body.ownerId,
        petImage: req.file ? req.file.filename : null // Use null if no image is uploaded
    });

    PetProfile.create(newPetProfile, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the Pet Profile."
            });
        } else {
            res.status(201).send(data);
        }
    });
};

exports.updatePetProfile = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Pet profile data is missing!" });
    }

    const petId = req.params.petId; // Assuming you're passing the ID as a route parameter

    // Object to hold updated data, conditionally including the image
    const updatedPetProfile = {
        petName: req.body.petName,
        petAge: req.body.petAge,
        vaccinationDate: req.body.vaccinationDate,
        petCategoryId: req.body.petCategoryId,
        ownerId: req.body.ownerId,
        petImage: req.file ? req.file.path : undefined // Keep existing image if no new image is uploaded
    };

    PetProfile.updateById(petId, updatedPetProfile, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Pet Profile with id ${petId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Pet Profile with id " + petId
                });
            }
        } else res.send(data);
    });
};

// Get a single PetProfile by ID
exports.getPetProfileById = (req, res) => {
    PetProfile.getById(req.params.petId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Pet Profile with id ${req.params.petId}.` });
            } else {
                res.status(500).send({ message: "Error retrieving Pet Profile with id " + req.params.petId });
            }
        } else res.send(data);
    });
};

// Get all PetProfiles
exports.getAllPetProfiles = (req, res) => {
    PetProfile.getAll((err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving pet profiles." });
        } else {
            res.send(data);
        }
    });
};

// Delete a PetProfile by ID
exports.deletePetProfileById = (req, res) => {
    PetProfile.deleteById(req.params.petId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Pet Profile with id ${req.params.petId}.` });
            } else {
                res.status(500).send({ message: "Could not delete Pet Profile with id " + req.params.petId });
            }
        } else res.send({ message: `Pet Profile was deleted successfully!` });
    });
};

// Delete all PetProfiles
exports.deleteAllPetProfiles = (req, res) => {
    PetProfile.deleteAll((err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Some error occurred while removing all pet profiles." });
        } else res.send({ message: `All Pet Profiles were deleted successfully!` });
    });
};

