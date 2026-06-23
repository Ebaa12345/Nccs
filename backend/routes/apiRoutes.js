const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Sequelize модель

// БҮРТГҮҮЛЭХ (REGISTER)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Хэрэглэгч бүртгэлтэй эсэхийг шалгах
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Хэрэглэгчийн нэр бүртгэгдсэн байна' });
    }

    // Шинэ хэрэглэгч үүсгэж бааз руу хадгалах
    const newUser = await User.create({
      username,
      password, // Бодит төсөл дээр үүнийг bcrypt-ээр нууцлах хэрэгтэй
      role: role || 'employee'
    });

    res.status(201).json({ message: 'Хэрэглэгч амжилттай бүртгэгдлээ', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
});

// НЭВТРЭХ (LOGIN)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Хэрэглэгчийг хайх
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' });
    }

    // Токен үүсгэх
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
});

module.exports = router;