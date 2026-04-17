import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sql from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const existing = await sql`
      SELECT airtable_id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const airtableId = `usr_${crypto.randomUUID()}`;

    await sql`
      INSERT INTO users (airtable_id, name, email, password)
      VALUES (${airtableId}, ${name}, ${email.toLowerCase()}, ${hashedPassword})
    `;

    return res.status(201).json({
      user: {
        id: airtableId,
        email: email.toLowerCase(),
        name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
