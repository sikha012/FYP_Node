const express = require('express');
const router = express.Router();

const {  create, getAll, getById, updateById, deleteById, deleteAll } = require('../controllers/productSellerController');

router.post('/productSeller', create);
router.get('/productSeller', getAll);
router.get('/productSeller/:sellerId', getById);
router.put('/productSeller/:sellerId', updateById);
router.delete('/productSeller/:sellerId', deleteById);
router.delete('/productSeller', deleteAll);

module.exports = router;
