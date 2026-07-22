// 📁 src/routes/authRoutes.js
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Нэвтрэх нэр, нууц үг заавал шаардлагатай' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' });
    }

    res.json({
      id:          user.id,
      username:    user.username,
      displayName: user.displayName,
      firstName:   user.firstName,
      lastName:    user.lastName,
      role:        user.role,
      jobTitle:    user.jobTitle,
    });

  } catch (err) {
    console.error('Нэвтрэхэд алдаа:', err);
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const userId = req.session?.userId || req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Нэвтрээгүй байна' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });

    res.json({
      id:          user.id,
      username:    user.username,
      displayName: user.displayName,
      firstName:   user.firstName,
      lastName:    user.lastName,
      role:        user.role,
      jobTitle:    user.jobTitle,
    });
  } catch (err) {
    res.status(500).json({ error: 'Серверийн алдаа' });
  }
});

module.exports = router;
