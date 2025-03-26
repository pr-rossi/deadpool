import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
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

    return res.status(200).json({ message: 'Valid reset token' });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 