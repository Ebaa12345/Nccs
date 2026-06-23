const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const User = require('../models/User');

// ⚠️  Clerk webhook нь RAW body шаардана — express.json() ажиллахгүй
// server.js-д энэ route-г express.json()-ийн ӨМНӨ тохируулсан байх ёстой

router.post(
  '/clerk',
  express.raw({ type: 'application/json' }), // raw body авна
  async (req, res) => {
    // ── 1. Signature шалгах ──────────────────────────────
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error('CLERK_WEBHOOK_SECRET .env-д байхгүй байна!');
      return res.status(500).json({ error: 'Webhook secret тохируулагдаагүй.' });
    }

    const wh = new Webhook(secret);
    let evt;

    // Debug: log body and headers
    console.log('Webhook received:');
    console.log('  Body type:', typeof req.body, req.body.constructor.name);
    console.log('  Body length:', req.body?.length);
    console.log('  Headers:', {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature']?.slice(0, 20) + '...',
    });

    try {
      evt = wh.verify(req.body, {
        'svix-id':        req.headers['svix-id'],
        'svix-timestamp': req.headers['svix-timestamp'],
        'svix-signature': req.headers['svix-signature'],
      });
    } catch (err) {
      console.error('❌ Webhook signature буруу:', err.message);
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const { type, data } = evt;
    console.log(`📩 Webhook event: ${type}`);

    try {
      // ── 2. user.created ──────────────────────────────────
      if (type === 'user.created' || type === 'user.updated') {
        const clerkId = data.id;
        const email = data.email_addresses?.[0]?.email_address || `clerk_${clerkId}@nccs.mn`;
        const username  = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Шинэ ажилтан';
        const role = data.public_metadata?.role || 'employee';

        // Sequelize findOrCreate эсвэл update
        const [user, created] = await User.findOrCreate({
          where: { username: email },
          defaults: { username: email, password: '', role }
        });

        if (!created) {
          await user.update({ role });
        }
        console.log(`✅ Хэрэглэгч синк хийгдлээ: ${user.username} (${user.role})`);
      }

      // ── 3. user.deleted ──────────────────────────────────
      if (type === 'user.deleted') {
        await User.destroy({
          where: { username: `clerk_${data.id}@nccs.mn` }
        });
        console.log(`🗑️  Хэрэглэгч устгагдлаа: ${data.id}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook боловсруулахад алдаа:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
