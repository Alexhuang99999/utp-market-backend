const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!email.toLowerCase().endsWith('@utp.ac.pa')) {
      return res.status(400).json({ message: 'Solo se permiten correos institucionales (@utp.ac.pa)' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Este correo ya está registrado' });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');

    await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password,
      verifyToken,
      isVerified: false
    });

    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({ 
      message: 'Cuenta creada. Revisa tu correo @utp.ac.pa para verificar tu cuenta.' 
    });

  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Por favor verifica tu correo antes de iniciar sesión' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    res.json({ message: '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.' });

  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe, verifyEmail };