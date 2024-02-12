const ProductSeller = require('../models/productSeller');

exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    const productSeller = new ProductSeller({
        sellerName: req.body.sellerName,
        sellerLocation: req.body.sellerLocation,
        sellerContact: req.body.sellerContact,
        sellerEmail: req.body.sellerEmail
    });

    ProductSeller.create(productSeller, (err, data) => {
        if (err) {
            if (err.kind === "already_exists") {
                res.status(409).send({
                    message: "Product Seller already exists!"
                });
            } else {
                res.status(500).send({
                    message: err.message || "Error during Product Seller creation"
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.updateById = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Empty Field!"
        });
    }

    const updatedProductSeller = {
        sellerName: req.body.sellerName,
        sellerLocation: req.body.sellerLocation,
        sellerContact: req.body.sellerContact,
        sellerEmail: req.body.sellerEmail
    };

    ProductSeller.updateById(req.params.sellerId, updatedProductSeller, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Product seller with Id ${req.params.sellerId} not found!`
                });
            } else {
                res.status(500).send({
                    message: `Error updating Product Seller with Id ${req.params.sellerId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getById = (req, res) => {
    ProductSeller.getById(req.params.sellerId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Product seller with Id ${req.params.sellerId} not found!`
                });
            } else {
                res.status(500).send({
                    message: `Error retrieving Product Seller with Id ${req.params.sellerId}`
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
};

exports.getAll = (req, res) => {
    ProductSeller.getAll((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Error while retrieving all Product Sellers"
            });
        } else {
            res.status(200).send(data);
        }
    });
};

exports.deleteById = (req, res) => {
    ProductSeller.deleteById(req.params.sellerId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Product Seller with Id ${req.params.sellerId} not found!`
                });
            } else {
                res.status(500).send({
                    message: `Error deleting Product Seller with Id ${req.params.sellerId}`
                });
            }
        } else {
            res.status(200).send({
                message: `Deleted Product Seller with Id ${req.params.sellerId}`
            });
        }
    });
};

exports.deleteAll = (req, res) => {
    ProductSeller.deleteAll((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Error during deletion of all Product Sellers"
            });
        } else {
            res.status(200).send({
                message: "All Product Sellers deleted successfully!"
            });
        }
    });
};
