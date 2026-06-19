require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

connectDB();

const app = express();

// CORS: solo permite peticiones desde el frontend (Vue) configurado en .env
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
  })
);

app.use(express.json());

// Limita peticiones para evitar abuso (100 peticiones por 15 min por IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Demasiadas peticiones, intenta de nuevo más tarde' },
});
app.use('/api/', limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Ruta de prueba para verificar que el servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UTP Marketplace API funcionando' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
