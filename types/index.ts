// GitHub Database Types
export interface ExerciseRecord {
    WorkoutWeek: string;
    WorkoutDay: string;
    Group: string;
    Exercises: string;
    Rounds: string;
    Reps: string;
    Rest: string;
    Notes: string;
    Video: string;
    id: string;
}

export interface Exercise {
    id: string;
    fields: ExerciseRecord;
}

export interface User {
    id: string;
    email: string;
    name: string;
    password?: string;
    resetToken?: string;
    resetTokenExpiry?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Progress {
    id: string;
    userId: string;
    exerciseId: string;
    completed: string; // "checked" or empty string
    lastUpdated: string;
    created_at: string;
    updated_at: string;
}

export interface HomePageProps {
    workoutData: Exercise[];
}

export type Step = 'landing' | 'week' | 'day' | 'workout' | 'exercise'; 