const PetCategory = require('../models/petCategory');
const { petCategoryId } = require('../models/petProfile');

exports.create = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    const petCategory = new PetCategory({
        petCategoryName: req.body.petCategoryName
    });

    PetCategory.create(petCategory, (err, data) => {
        if(err) {
            if(err.kind === "already_exists") {
                res.status(409).send({
                    message: "Pet Category already exists!"
                });
            } else {
                res.status(500).send({
                    message: err.message || "Error during Pet Category creation"
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.updateById = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    PetCategory.updateById(req.params.petCategoryId, new PetCategory(req.body), (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Pet category with Id ${req.params.petCategoryId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error updating Pet Category with Id ${req.params.petCategoryId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getById = (req, res) => {

    PetCategory.getById(req.params.petCategoryId,(err, data) => {
        if(err){
            if(err.kind === "not_found") {
                res.status(404).send({
                    message: `Pet category with Id ${req.params.petCategoryId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error getting Pet Category with Id ${req.params.petCategoryId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
}

exports.getAll = (req, res) => {
    PetCategory.getAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error while getting all Pet categories"
            });
        } else {
            res.status(200).send(data);
        }
    });
}

exports.deleteById = (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    PetCategory.deleteById(req.params.petCategoryId, (err, data) => {
        if(err) {
            if(err.kind === "not_found"){
                res.status(404).send({
                    message: `Pet category with Id ${req.params.petCategoryId} not Found!`
                });
            } else {
                res.status(500).send({
                    message: `Error deleting Pet Category with Id ${req.params.petCategoryId}`
                });
            }
        } else {
            res.status(200).send({
                message: `Deleted Pet category with Id ${req.params.petCategoryId}`
            });
        }
    });
};

exports.deleteAll = (req, res) => {
    PetCategory.deleteAll((err, data) => {
        if(err) {
            res.status(500).send({
                message: err.message || "Error during deletion of all Pet categories"
            });
        } else {
            res.status(200).send({
                message: `All Pet categories deleted successfully!`
            });
        } 
    });
}