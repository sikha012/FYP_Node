const { validationResult } = require('express-validator');
const PetProfile = require('../models/petProfile');

exports.createPetProfile = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Pet profile data is missing!" });
    }
    const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            });
         }

    const newPetProfile = new PetProfile({
        petName: req.body.petName,
        petAge: req.body.petAge,
        petCategoryId: req.body.petCategoryId,
        ownerId: req.body.ownerId,
        //ownerId: req.user.id,
        petImage: req.file ? req.file.filename : null 
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

exports.createPetHistory = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Pet history data is missing!" });
    }
    const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            });
         }
    
    const eventName = req.body.eventName;
    const eventDescription = req.body.eventDescription;
    const eventDate = req.body.eventDate;
    const petId = req.body.petId;
    
    PetProfile.createPetHistory(eventName, eventDescription, eventDate, petId, (error, data) => {
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

    const petId = req.params.petId;

    const updatedPetProfile = {
        petName: req.body.petName ? req.body.petName : null,
        petAge: req.body.petAge,
        petCategoryId: req.body.petCategoryId ? req.body.petCategoryId : null,
        ownerId: req.body.ownerId ? req.body.ownerId : null,
        petImage: req.file ? req.file.filename : null
    };

    if(req.file != null) {
        PetProfile.updateByIdWithImage(petId, updatedPetProfile, (error, data) => {
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
            } else res.status(201).send(data);
        });
    } else {
        PetProfile.updateByIdWithoutImage(petId, updatedPetProfile, (error, data) => {
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
            } else res.status(201).send(data);
        });
    }
   
};

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

exports.getHistoryByPetId = (req, res) => {
    PetProfile.getHistoryByPetId(req.params.petId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Pet Records for pet with id ${req.params.petId}.` });
            } else {
                res.status(500).send({ message: "Error retrieving Pet Record for pet with id " + req.params.petId });
            }
        } else res.send(data);
    });
};

exports.getAllByOwnerId = (req, res) => {
    PetProfile.getAllByOwnerId(req.params.ownerId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Pet Profile with owner_id ${req.params.ownerId}.` });
            } else {
                res.status(500).send({ message: "Error retrieving Pet Profile with owner_id " + req.params.ownerId });
            }
        } else res.status(200).send(data);
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
exports.deleteByPetId = (req, res) => {
    PetProfile.deleteByPetId(req.params.petId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Pet Profile with id ${req.params.petId}.` });
            } else {
                res.status(500).send({ message: "Could not delete Pet Profile with id " + req.params.petId });
            }
        } else res.send({ message: `Pet Profile was deleted successfully!` });
    });
};

exports.deleteHistoryById = (req, res) => {
    PetProfile.deleteHistoryById(req.params.historyId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Pet History with id ${req.params.historyId}.` });
            } else {
                res.status(500).send({ message: "Could not delete Pet History with id " + req.params.historyId });
            }
        } else res.send({ message: `Pet History was deleted successfully!` });
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

