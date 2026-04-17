// GitHub Database Service - Fetches data from GitHub API
// Repository: https://github.com/pushrefresh/workout-database

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
  id: string;
  userId: string;
  exerciseId: string;
  completed: string; // "checked" or empty string
  lastUpdated: string;
  created_at: string;
  updated_at: string;
}

class GitHubDatabase {
  private baseUrl = 'https://api.github.com/repos/pushrefresh/workout-database/contents/data';
  private token = process.env.GITHUB_TOKEN; // You'll need to set this in Vercel

  private async fetchFromGitHub(path: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${path}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'rossifit-app'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const files = await response.json();
      const results: any[] = [];

      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          try {
            const fileResponse = await fetch(file.download_url, {
              headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'rossifit-app'
              }
            });
            
            if (fileResponse.ok) {
              const data = await fileResponse.json();
              results.push(data);
            }
          } catch (error) {
            console.error(`Error fetching file ${file.name}:`, error);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching from GitHub:', error);
      return [];
    }
  }

  // Users
  async getAllUsers(): Promise<GitHubUser[]> {
    return this.fetchFromGitHub('users-grid view');
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
    // Note: Creating users via GitHub API requires more complex implementation
    // For now, this is a placeholder that would need GitHub API file creation
    throw new Error('User creation not implemented for GitHub API');
  }

  async updateUser(id: string, updates: Partial<GitHubUser>): Promise<GitHubUser | null> {
    // Note: Updating users via GitHub API requires more complex implementation
    // For now, this is a placeholder that would need GitHub API file updates
    throw new Error('User updates not implemented for GitHub API');
  }

  // Workouts
  async getAllWorkouts(): Promise<GitHubWorkout[]> {
    return this.fetchFromGitHub('workout-grid view');
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

  // Progress - Note: These methods are read-only for GitHub API
  // Progress updates would need to be handled differently (local storage, separate API, etc.)
  async getAllProgress(): Promise<GitHubProgress[]> {
    return this.fetchFromGitHub('progress-grid view');
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

  // These methods are not supported with GitHub API read-only access
  async createProgress(progressData: Omit<GitHubProgress, 'id' | 'created_at' | 'updated_at'>): Promise<GitHubProgress> {
    throw new Error('Progress creation not supported with GitHub API read-only access');
  }

  async updateProgress(id: string, updates: Partial<GitHubProgress>): Promise<GitHubProgress | null> {
    throw new Error('Progress updates not supported with GitHub API read-only access');
  }

  async deleteProgress(id: string): Promise<boolean> {
    throw new Error('Progress deletion not supported with GitHub API read-only access');
  }
}

export const githubDb = new GitHubDatabase();