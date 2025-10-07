import fs from 'fs/promises';
import path from 'path';

// Database paths
const DB_PATH = '/Users/michaelrossi/Development/Github/workout-database/data';

export interface GitHubUser {
  name: string;
  email: string;
  password: string;
  resetToken: string;
  resetTokenExpiry: string;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubWorkout {
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
  created_at: string;
  updated_at: string;
}

export interface GitHubProgress {
  userId: string;
  exerciseId: string;
  completed: string;
  lastUpdated: string;
  id: string;
  created_at: string;
  updated_at: string;
}

class GitHubDatabase {
  private async readJsonFile<T>(filePath: string): Promise<T> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  private async readAllJsonFiles<T>(dirPath: string): Promise<T[]> {
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const data = await Promise.all(
        jsonFiles.map(file => 
          this.readJsonFile<T>(path.join(dirPath, file))
        )
      );
      
      return data;
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      throw error;
    }
  }

  // Users
  async getAllUsers(): Promise<GitHubUser[]> {
    return this.readAllJsonFiles<GitHubUser>(path.join(DB_PATH, 'users-grid view'));
  }

  async getUserByEmail(email: string): Promise<GitHubUser | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  async getUserById(id: string): Promise<GitHubUser | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  async createUser(userData: Omit<GitHubUser, 'id' | 'created_at' | 'updated_at'>): Promise<GitHubUser> {
    const id = `users-grid view_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newUser: GitHubUser = {
      ...userData,
      id,
      created_at: now,
      updated_at: now
    };

    const filePath = path.join(DB_PATH, 'users-grid view', `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newUser, null, 2));
    
    return newUser;
  }

  async updateUser(id: string, updates: Partial<GitHubUser>): Promise<GitHubUser | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const filePath = path.join(DB_PATH, 'users-grid view', `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(updatedUser, null, 2));
    
    return updatedUser;
  }

  // Workouts
  async getAllWorkouts(): Promise<GitHubWorkout[]> {
    return this.readAllJsonFiles<GitHubWorkout>(path.join(DB_PATH, 'workout-grid view'));
  }

  async getWorkoutsByWeek(week: string): Promise<GitHubWorkout[]> {
    const workouts = await this.getAllWorkouts();
    return workouts.filter(workout => workout.WorkoutWeek === week);
  }

  async getWorkoutsByDay(week: string, day: string): Promise<GitHubWorkout[]> {
    const workouts = await this.getAllWorkouts();
    return workouts.filter(workout => 
      workout.WorkoutWeek === week && workout.WorkoutDay === day
    );
  }

  // Progress
  async getAllProgress(): Promise<GitHubProgress[]> {
    return this.readAllJsonFiles<GitHubProgress>(path.join(DB_PATH, 'progress-grid view'));
  }

  async getProgressByUserId(userId: string): Promise<GitHubProgress[]> {
    const progress = await this.getAllProgress();
    return progress.filter(p => p.userId === userId);
  }

  async getProgressByExerciseId(exerciseId: string): Promise<GitHubProgress[]> {
    const progress = await this.getAllProgress();
    return progress.filter(p => p.exerciseId === exerciseId);
  }

  async getProgressByUserAndExercise(userId: string, exerciseId: string): Promise<GitHubProgress | null> {
    const progress = await this.getAllProgress();
    return progress.find(p => p.userId === userId && p.exerciseId === exerciseId) || null;
  }

  async createProgress(progressData: Omit<GitHubProgress, 'id' | 'created_at' | 'updated_at'>): Promise<GitHubProgress> {
    const id = `progress-grid view_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newProgress: GitHubProgress = {
      ...progressData,
      id,
      created_at: now,
      updated_at: now
    };

    const filePath = path.join(DB_PATH, 'progress-grid view', `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newProgress, null, 2));
    
    return newProgress;
  }

  async updateProgress(id: string, updates: Partial<GitHubProgress>): Promise<GitHubProgress | null> {
    const progress = await this.getAllProgress();
    const existingProgress = progress.find(p => p.id === id);
    if (!existingProgress) return null;

    const updatedProgress = {
      ...existingProgress,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const filePath = path.join(DB_PATH, 'progress-grid view', `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(updatedProgress, null, 2));
    
    return updatedProgress;
  }

  async deleteProgress(id: string): Promise<boolean> {
    try {
      const filePath = path.join(DB_PATH, 'progress-grid view', `${id}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting progress ${id}:`, error);
      return false;
    }
  }
}

export const githubDb = new GitHubDatabase();
