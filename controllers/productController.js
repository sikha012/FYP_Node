const Product = require('../models/product');

exports.createProduct = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data is missing!" });
    }

    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        image: req.file.filename,
        petCategoryId: req.body.petCategoryId,
        productCategoryId: req.body.productCategoryId,
        productSellerId: req.body.productSellerId
    });

    Product.create(newProduct, (error, data) => {
        if (error) {
            res.status(500).send({
                message: error.message || "Some error occurred while creating the Product."
            });
        } else {
            res.status(201).send(data);
        }
    });
};

exports.updateProduct = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Product data is missing!" });
    }

    const productId = req.params.productId;
    const prevFileName = req.body.previousFile
    // console.log(`${req.file.filename}`);
    // console.log(`${req.file}`);

    const updatedProduct = {
        name: req.body.name,
        price: req.body.price,
        stockQuantity: req.body.stockQuantity,
        description: req.body.description,
        image: req.file ? req.file.filename : prevFileName,
        petCategoryId: req.body.petCategoryId,
        productCategoryId: req.body.productCategoryId,
        productSellerId: req.body.productSellerId
    };

    Product.updateById(productId, updatedProduct, (error, data) => {
        if (error) {
            if (error.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Product with id ${productId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error updating Product with id " + productId
                });
            }
        } else res.status(200).send(data);
    });
};

exports.getProductById = (req, res) => {
    Product.getById(req.params.productId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Product with id ${req.params.productId}.` });
            } else {
                res.status(500).send({ message: "Error retrieving Product with id " + req.params.productId });
            }
        } else res.send(data);
    });
};

exports.getAllProducts = (req, res) => {
    Product.getAll((err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving products." });
        } else {
            res.send(data);
        }
    });
};

exports.getAllProductsForSeller = (req, res) => {
    const seller = req.body.seller;
    Product.getAllForSeller(seller, (err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Some error occurred while retrieving products." });
        } else {
            res.send(data);
        }
    });
};

exports.deleteProductById = (req, res) => {
    Product.deleteById(req.params.productId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Product with id ${req.params.productId}.` });
            } else {
                res.status(500).send({ message: "Could not delete Product with id " + req.params.productId });
            }
        } else res.send({ message: `Product was deleted successfully!` });
    });
};

exports.deleteAllProducts = (req, res) => {
    Product.deleteAll((err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Some error occurred while removing all products." });
        } else res.send({ message: `All Products were deleted successfully!` });
    });
};
