export interface ParsedExercise {
  workout_week: number;
  workout_day: string;
  exercise_group: string;
  exercise_name: string;
  rounds: number | null;
  reps: string | null;
  rest: string | null;
  notes: string | null;
}

export interface ParsedProgram {
  name: string;
  description: string;
  duration_weeks: number;
  difficulty: string;
  exercises: ParsedExercise[];
}

/**
 * Extract and parse a program JSON from Claude's response.
 * Looks for content between <program> and </program> tags.
 */
export function extractProgram(text: string): ParsedProgram | null {
  const match = text.match(/<program>\s*([\s\S]*?)\s*<\/program>/);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1]);

    // Validate required fields
    if (!raw.name || !raw.duration_weeks || !Array.isArray(raw.exercises)) {
      return null;
    }

    return {
      name: raw.name,
      description: raw.description || '',
      duration_weeks: raw.duration_weeks,
      difficulty: raw.difficulty || 'Intermediate',
      exercises: raw.exercises.map((ex: any) => ({
        workout_week: ex.workout_week || 1,
        workout_day: ex.workout_day || 'Day 1',
        exercise_group: ex.exercise_group || 'Exercise 1',
        exercise_name: ex.exercise_name || 'Unknown Exercise',
        rounds: ex.rounds ?? null,
        reps: ex.reps ?? null,
        rest: ex.rest ?? null,
        notes: ex.notes ?? null,
      })),
    };
  } catch (e) {
    console.error('Failed to parse program JSON:', e);
    return null;
  }
}
