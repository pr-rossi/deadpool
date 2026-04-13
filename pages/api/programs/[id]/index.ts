import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../../lib/db';
import { mapWorkoutRow } from '../../../../lib/mapWorkout';

const DEFAULT_PROGRAM_ID = '00000000-0000-0000-0000-000000000001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const [program] = await sql`SELECT * FROM programs WHERE id = ${id as string}`;
      if (!program) return res.status(404).json({ message: 'Program not found' });

      let exercises;
      if (program.source === 'default') {
        const rows = await sql`
          SELECT airtable_id, workout_week, workout_day, exercise_group,
                 exercise_name, rounds, reps, rest, notes, video_url
          FROM workouts ORDER BY workout_week, workout_day, exercise_group
        `;
        exercises = rows.map(mapWorkoutRow);
      } else {
        const rows = await sql`
          SELECT id, workout_week, workout_day, exercise_group,
                 exercise_name, rounds, reps, rest, notes, video_url
          FROM program_exercises WHERE program_id = ${id as string}
          ORDER BY workout_week, workout_day, exercise_order, exercise_group
        `;
        exercises = rows.map(row => ({
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

      return res.status(200).json({ program, exercises });
    }

    if (req.method === 'DELETE') {
      if (id === DEFAULT_PROGRAM_ID) {
        return res.status(400).json({ message: 'Cannot delete the default program' });
      }

      await sql`DELETE FROM programs WHERE id = ${id as string}`;
      return res.status(200).json({ message: 'Program deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Program detail error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
