import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Find user with matching reset token that hasn't expired
    const rows = await sql`
      SELECT airtable_id FROM users
      WHERE reset_token = ${token} AND reset_token_expiry > NOW()
    `;

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    return res.status(200).json({ message: 'Valid reset token' });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
