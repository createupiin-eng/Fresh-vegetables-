// File: api/user.js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  // Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Database Connection (Secure Parameterized Query use karenge taaki Hack na ho)
  const connection = await mysql.createConnection({
    host: '168.119.36.223', // Apna IP yahan dalein
    user: 'battlefa_sdz1',
    password: 'battlefa_sdz1',    // Apna DB Password yahan dalein
    database: 'battlefa_sdz1',
    port: 3306
  });

  try {
    // Sirf wahi user dhundo jiska email match ho
    const [rows] = await connection.execute(
      'SELECT full_name, wallet_balance FROM users WHERE email = ?',
      [email] // SQL Injection se bachne ke liye '?' use kiya hai
    );

    if (rows.length > 0) {
      res.status(200).json({ success: true, user: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await connection.end();
  }
}