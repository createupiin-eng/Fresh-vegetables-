const { connect, User } = require('../lib/db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await connect();
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'All fields required' });
      return;
    }
    const emailLower = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: emailLower,
      phone: String(phone).trim(),
      password: hash,
      wallet: 100,
    });
    res.status(201).json({ message: 'Signup successful', userId: user._id });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
