import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  throw new Error('Airtable API key or base ID is not set in environment variables');
}

const base = new Airtable({ apiKey }).base(baseId);

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
    // Query the Users table for a matching user
    const records = await base('Users')
      .select({
        filterByFormula: `AND({email} = '${email}', {password} = '${password}')`,
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = records[0];
    
    // Return user data (excluding password)
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.fields.email,
        name: user.fields.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 