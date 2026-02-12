const { connect, User, Transaction } = require('../lib/db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect();
    const auth = req.headers.authorization || '';
    const parts = auth.split(' ');
    if (parts[0] !== 'Bearer' || !parts[1]) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const amount = 10;
    const { pudinaNumber } = req.body || {};
    const num = pudinaNumber ? String(pudinaNumber).trim() : '';
    if (num && !/^\d{12}$/.test(num)) {
      res.status(400).json({ error: 'Pudina number must be 12 digits' });
      return;
    }
    if (user.wallet < amount) {
      res.status(400).json({ error: 'Insufficient wallet' });
      return;
    }
    user.wallet -= amount;
    await user.save();
    await Transaction.create({
      userId: user._id,
      amount,
      pudinaNumber: num || undefined,
    });
    res.status(200).json({ message: 'Purchase successful', wallet: user.wallet });
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
