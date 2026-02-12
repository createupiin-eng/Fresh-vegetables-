import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)",
      [full_name, email, phone, hashedPassword]
    );

    return res.status(200).json({ success: true, message: "Account created successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
