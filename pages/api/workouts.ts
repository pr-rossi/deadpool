import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../lib/db';
import { mapWorkoutRow } from '../../lib/mapWorkout';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers for React Native app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rows = await sql`
      SELECT airtable_id, workout_week, workout_day, exercise_group,
             exercise_name, rounds, reps, rest, notes, video_url
      FROM workouts
      ORDER BY workout_week, workout_day, exercise_group
    `;

    const workoutData = rows.map(mapWorkoutRow);
    return res.status(200).json({ workoutData });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
