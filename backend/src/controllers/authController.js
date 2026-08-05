const authService = require('../services/authService');

/*
* Register a new user
* POST /api/auth/register
* (Public)
*/
const register = async (req, res) => {
  const { name, email, password, role, specialization, level } = req.body;

  const { user, token } = await authService.register({
    name,
    email,
    password,
    role,
    specialization,
    level,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      token,
    },
  });
};

/*
* Login user
* POST /api/auth/login
* (Public)
*/
const login = async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
};

module.exports = { register, login };
