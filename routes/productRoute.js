const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const productController = require('../controllers/productController');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/product_images'));
    },
    filename: function(req, file, cb) {
        const imageName = Date.now() + '-' + file.originalname;
        cb(null, imageName);
    }
});

const filefilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|octet-stream/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    console.log(file.originalname);
    console.log(file.mimetype);
    console.log(path.extname(file.originalname).toLowerCase());
    console.log(extname);
    console.log(`fine 1`);
    const mimetype = fileTypes.test(file.mimetype);
    console.log(mimetype);
    console.log(`fine 2`);
    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid Image Type! Only JPEG, JPG, and PNG supported');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: filefilter
}).single('image');

router.post('/product', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send({ message: err });
        } else {
            productController.createProduct(req, res);
        }
    });
});

router.put('/product/:productId', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send({ message: err });
        } else {
            productController.updateProduct(req, res);
        }
    });
});

router.get('/product/:productId', productController.getProductById);

router.get('/product', productController.getAllProducts);

router.post('/product/filter', productController.getProductsAfterFilter);

router.get('/product/seller/:sellerId', productController.getAllProductsForSeller);

router.delete('/product/:productId', productController.deleteProductById);

router.delete('/product', productController.deleteAllProducts);

module.exports = router;
