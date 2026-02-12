// api/login.js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  // CORS Headers (Taaki frontend se connect ho sake)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Production mein '*' ko apni site ka URL banadein
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle Preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Database Connection
  // Dhyan de: host mein 'localhost' nahi, cPanel ka IP aayega
  const connection = await mysql.createConnection({
    host: '168.119.36.223', // cPanel ka Shared IP yahan dalein
    user: 'battlefa_sdz1',
    password: 'battlefa_sdz1', // Apna asli DB password yahan dalein
    database: 'battlefa_sdz1',
    port: 3306 // Standard MySQL port
  });

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?', // Table name check kar lena
      [email, password]
    );

    if (rows.length > 0) {
      res.status(200).json({ success: true, message: 'Login Successful', user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await connection.end();
  }
}
