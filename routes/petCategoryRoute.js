const express = require('express');

const router = express.Router();

const {create, getAll, getById, updateById, deleteById, deleteAll} = require('../controllers/petCategoryController');

// Pet Category Routes
router.post('/petCategory', create);
router.get('/petCategory', getAll);
router.get('/petCategory/:petCategoryId', getById);
router.put('/petCategory/:petCategoryId', updateById);
router.delete('/petCategory/:petCategoryId', deleteById);
router.delete('/petCategory', deleteAll);

module.exports = router;