import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { userId } = req.body;

  if (!userId || !id) {
    return res.status(400).json({ message: 'userId and program id are required' });
  }

  try {
    // Verify the user owns this program
    const [program] = await sql`SELECT * FROM programs WHERE id = ${id as string} AND user_id = ${userId}`;
    if (!program) {
      return res.status(403).json({ message: 'You can only share programs you created' });
    }

    // Set source to 'community' and user_id to 'default' so all users can see it
    await sql`UPDATE programs SET source = 'default', user_id = 'default' WHERE id = ${id as string}`;

    return res.status(200).json({ message: 'Program shared with community' });
  } catch (error) {
    console.error('Share program error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
