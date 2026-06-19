// Middleware centralizado para manejar errores de forma consistente
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Error de clave duplicada (ej: email ya registrado)
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Este correo ya está registrado' });
  }

  // Error de formato de ObjectId inválido
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID no válido' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
