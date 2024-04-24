const express = require('express');

const router = express.Router();

const path = require('path');

const {create, getAll, getById, updateById, deleteById, deleteAll} = require('../controllers/productCategoryController');


router.post('/productCategory', create);
router.get('/productCategory', getAll);
router.get('/productCategory/:productCategoryId', getById);
router.put('/productCategory/:productCategoryId', updateById);
router.delete('/productCategory/:productCategoryId', deleteById);
router.delete('/productCategory', deleteAll);

module.exports = router;