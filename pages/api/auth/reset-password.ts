import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';
import bcrypt from 'bcryptjs';

const apiKey = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  throw new Error('Missing Airtable configuration');
}

const base = new Airtable({ apiKey }).base(baseId);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    // Find user with matching reset token
    const records = await base('Users')
      .select({
        filterByFormula: `AND({resetToken} = '${token}', {resetTokenExpiry} > '${new Date().toISOString()}')`,
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = records[0];

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    await base('Users').update(user.id, {
      password: hashedPassword,
      resetToken: '',
      resetTokenExpiry: '',
    });

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 