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
    await sql`UPDATE programs SET is_active = FALSE WHERE id = ${id as string} AND (user_id = ${userId} OR user_id = 'default')`;
    return res.status(200).json({ message: 'Program deactivated' });
  } catch (error) {
    console.error('Deactivate program error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
