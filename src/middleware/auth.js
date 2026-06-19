const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protege rutas que requieren estar autenticado
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token no válido o expirado' });
    }
  }

  return res.status(401).json({ message: 'No autorizado, falta token' });
};

module.exports = { protect };
