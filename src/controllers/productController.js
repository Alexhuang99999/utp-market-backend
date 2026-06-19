const Product = require('../models/Product');
const { uploadToCloudinary } = require('../config/cloudinary');

// POST /api/products  (crear producto, requiere login)
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Debes subir al menos 1 imagen' });
    }

    // Sube todas las imágenes a Cloudinary en paralelo y obtiene sus URLs
    const images = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );

    const product = await Product.create({
      title,
      description,
      price,
      category,
      images,
      seller: req.user._id,
    });

    const populated = await product.populate('seller', 'name whatsapp');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/products  (lista con filtros opcionales: category, search, page)
const getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const filter = { status: 'disponible' };

    if (category) {
      filter.category = category;
    }

    if (search) {
      // Búsqueda simple por texto en título y descripción
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id  (detalle de un producto)
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name whatsapp'
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/mine  (productos publicados por el usuario logueado)
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id/status  (marcar como vendido / disponible)
const updateProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso sobre este producto' });
    }

    product.status = req.body.status === 'vendido' ? 'vendido' : 'disponible';
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso sobre este producto' });
    }

    await product.deleteOne();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/categories  (lista fija de categorías para el frontend)
const getCategories = async (req, res) => {
  res.json(Product.CATEGORIES);
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProductStatus,
  deleteProduct,
  getCategories,
};
