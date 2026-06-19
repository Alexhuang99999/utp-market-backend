const mongoose = require('mongoose');

const CATEGORIES = [
  'Libros',
  'Calculadoras',
  'Apuntes',
  'Laptops',
  'Monitores',
  'Celulares',
  'Electrónica',
  'Otros',
];

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    images: {
      // Array de URLs de Cloudinary, mínimo 1, máximo 5
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 5,
        message: 'Debes subir entre 1 y 5 imágenes',
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      // Permite marcar como vendido sin necesidad de borrar el producto
      type: String,
      enum: ['disponible', 'vendido'],
      default: 'disponible',
    },
  },
  { timestamps: true }
);

// Índices para búsqueda rápida por texto y filtrado por categoría
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

productSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Product', productSchema);
