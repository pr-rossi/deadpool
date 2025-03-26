import { FieldSet } from 'airtable';

export interface ExerciseRecord extends FieldSet {
    [key: string]: any;
    WorkoutWeek?: string;
    WorkoutDay?: string;
    Group?: string;
    Exercises?: string;
    Rounds?: number;
    Reps?: string;
    Rest?: number;
    Notes?: string;
    id?: string;
    Video?: { url: string }[];
}

export interface Exercise {
    id: string;
    fields: ExerciseRecord;
}

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface Progress {
    exerciseId: string;
    completed: boolean;
    lastUpdated: string;
}

export interface HomePageProps {
    workoutData: Exercise[];
}

export type Step = 'landing' | 'week' | 'day' | 'workout' | 'exercise'; 