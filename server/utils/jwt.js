const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET || 'campusconnect_jwt_secret_dev_key',
    {
      expiresIn: '7d'
    }
  );
};

module.exports = { generateToken };
