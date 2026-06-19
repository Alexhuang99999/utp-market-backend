const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProductStatus,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Rutas públicas (no requieren login, para poder navegar y buscar libremente)
router.get('/categories', getCategories);
router.get('/', getProducts);

// Rutas privadas (requieren login) - deben ir antes de '/:id' para no chocar
router.get('/mine', protect, getMyProducts);
router.post('/', protect, upload.array('images', 5), createProduct);
router.patch('/:id/status', protect, updateProductStatus);
router.delete('/:id', protect, deleteProduct);

// Ruta pública con parámetro - va al final
router.get('/:id', getProductById);

module.exports = router;
