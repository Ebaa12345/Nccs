// 📁 src/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

// POST /api/auth/azure-callback
router.post('/azure-callback', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken байхгүй байна' });

    const decoded = jwt.decode(idToken);
    if (!decoded) return res.status(400).json({ error: 'Token буруу байна' });

    const microsoftId = decoded.oid;
    const email       = decoded.preferred_username || decoded.email || '';
    const firstName   = decoded.given_name   || '';
    const lastName    = decoded.family_name  || '';
    const displayName = decoded.name || `${firstName} ${lastName}`.trim() || email;
    const username    = email.split('@')[0] || microsoftId;

    if (!microsoftId) return res.status(400).json({ error: 'Microsoft ID олдсонгүй' });

    // ✅ findOrCreate ашиглан давхар бүртгэл үүсэхээс сэргийлнэ
    const [user, created] = await User.findOrCreate({
      where: { microsoftId },
      defaults: {
        username,
        displayName,
        firstName,
        lastName,
        role: 'user',
        password: '',
      },
    });

    // Байгаа хэрэглэгч бол нэрийг шинэчлэнэ
    if (!created) {
      await user.update({ displayName, firstName, lastName });
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
    console.error('Azure callback алдаа:', err);
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
