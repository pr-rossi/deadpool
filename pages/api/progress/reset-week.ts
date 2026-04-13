import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, weekNumber } = req.body;

    if (!userId || !weekNumber) {
      return res.status(400).json({ message: 'User ID and Week Number are required' });
    }

    await sql`
      DELETE FROM progress
      WHERE user_id = ${userId}
      AND exercise_id IN (
        SELECT airtable_id FROM workouts WHERE workout_week = ${parseInt(weekNumber)}
      )
    `;

    return res.status(200).json({ message: 'Week progress reset successfully' });
  } catch (error) {
    console.error('Error resetting week progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
