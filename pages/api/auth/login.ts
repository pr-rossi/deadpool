import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import sql from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const rows = await sql`
      SELECT airtable_id, name, email, password FROM users WHERE email = ${email}
    `;

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Handle both bcrypt hashed and plaintext passwords
    let passwordMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = password === user.password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      user: {
        id: user.airtable_id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
