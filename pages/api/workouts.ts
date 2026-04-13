import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../lib/db';
import { mapWorkoutRow } from '../../lib/mapWorkout';

const DEFAULT_PROGRAM_ID = '00000000-0000-0000-0000-000000000001';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { programId } = req.query;
    const pid = (typeof programId === 'string' ? programId : null) || DEFAULT_PROGRAM_ID;

    let workoutData;

    if (pid === DEFAULT_PROGRAM_ID) {
      // Query the original workouts table
      const rows = await sql`
        SELECT airtable_id, workout_week, workout_day, exercise_group,
               exercise_name, rounds, reps, rest, notes, video_url
        FROM workouts
        ORDER BY workout_week, workout_day, exercise_group
      `;
      workoutData = rows.map(mapWorkoutRow);
    } else {
      // Query custom program exercises
      const rows = await sql`
        SELECT id, workout_week, workout_day, exercise_group,
               exercise_name, rounds, reps, rest, notes, video_url
        FROM program_exercises
        WHERE program_id = ${pid}
        ORDER BY workout_week, workout_day, exercise_order, exercise_group
      `;
      workoutData = rows.map(row => ({
        id: row.id,
        fields: {
          WorkoutWeek: String(row.workout_week),
          WorkoutDay: row.workout_day,
          Group: row.exercise_group,
          Exercises: row.exercise_name,
          Rounds: row.rounds,
          Reps: row.reps,
          Rest: row.rest,
          Notes: row.notes,
          Video: row.video_url ? [{ url: row.video_url }] : undefined,
        },
      }));
    }

    return res.status(200).json({ workoutData });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
