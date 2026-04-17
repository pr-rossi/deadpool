import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

const DEFAULT_PROGRAM_ID = '00000000-0000-0000-0000-000000000001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'userId is required' });
      }

      // Get user's programs + default programs + community-shared programs
      const programs = await sql`
        SELECT p.*,
          CASE
            WHEN p.source = 'default' THEN (SELECT COUNT(*) FROM workouts)
            ELSE (SELECT COUNT(*) FROM program_exercises WHERE program_id = p.id)
          END as exercise_count
        FROM programs p
        WHERE p.user_id = ${userId} OR p.user_id = 'default' OR p.source = 'community'
        ORDER BY p.created_at ASC
      `;

      return res.status(200).json({ programs });
    }

    if (req.method === 'POST') {
      const { userId, name, description, duration_weeks, difficulty, source, exercises } = req.body;

      if (!userId || !name || !duration_weeks) {
        return res.status(400).json({ message: 'userId, name, and duration_weeks are required' });
      }

      // Create the program
      const [program] = await sql`
        INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, source)
        VALUES (${userId}, ${name}, ${description || null}, ${duration_weeks}, ${difficulty || 'Intermediate'}, ${source || 'ai_chat'})
        RETURNING *
      `;

      // Bulk insert exercises if provided
      if (exercises && exercises.length > 0) {
        for (const ex of exercises) {
          await sql`
            INSERT INTO program_exercises (program_id, exercise_order, workout_week, workout_day, exercise_group, exercise_name, rounds, reps, rest, notes)
            VALUES (${program.id}, ${ex.exercise_order || null}, ${ex.workout_week}, ${ex.workout_day}, ${ex.exercise_group}, ${ex.exercise_name}, ${ex.rounds || null}, ${ex.reps || null}, ${ex.rest || null}, ${ex.notes || null})
          `;
        }
      }

      // Auto-activate: deactivate others, activate this one
      await sql`UPDATE programs SET is_active = FALSE WHERE user_id = ${userId}`;
      await sql`UPDATE programs SET is_active = TRUE WHERE id = ${program.id}`;

      return res.status(201).json({ program: { ...program, is_active: true } });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Programs error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
