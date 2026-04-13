import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const { userId, exerciseId, completed } = req.body;

      if (!userId || !exerciseId) {
        return res.status(400).json({ message: 'User ID and Exercise ID are required' });
      }

      await sql`
        INSERT INTO progress (user_id, exercise_id, completed, last_updated)
        VALUES (${userId}, ${exerciseId}, ${completed}, NOW())
        ON CONFLICT (user_id, exercise_id)
        DO UPDATE SET completed = ${completed}, last_updated = NOW()
      `;

      return res.status(200).json({ message: 'Progress updated successfully' });
    } else if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const rows = await sql`
        SELECT exercise_id, completed, last_updated FROM progress WHERE user_id = ${userId}
      `;

      const progress = rows.map(row => ({
        exerciseId: row.exercise_id,
        completed: row.completed,
        lastUpdated: row.last_updated,
      }));

      return res.status(200).json({ progress });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Progress error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
