import { Exercise } from '../types';

/**
 * Maps a Postgres workout row to the Exercise shape the frontend expects.
 */
export function mapWorkoutRow(row: any): Exercise {
  return {
    id: row.airtable_id,
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
  };
}
