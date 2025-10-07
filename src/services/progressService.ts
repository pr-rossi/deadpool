// In-memory progress service for handling user progress
// This is a temporary solution until we implement a proper database

export interface Progress {
  id: string;
  userId: string;
  exerciseId: string;
  completed: string; // "checked" or empty string
  lastUpdated: string;
  created_at: string;
  updated_at: string;
}

class ProgressService {
  private progress: Map<string, Progress> = new Map();

  async createProgress(progressData: Omit<Progress, 'id' | 'created_at' | 'updated_at'>): Promise<Progress> {
    const id = `progress_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newProgress: Progress = {
      ...progressData,
      id,
      created_at: now,
      updated_at: now
    };

    this.progress.set(id, newProgress);
    return newProgress;
  }

  async updateProgress(id: string, updates: Partial<Progress>): Promise<Progress | null> {
    const existing = this.progress.get(id);
    if (!existing) return null;

    const updatedProgress = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.progress.set(id, updatedProgress);
    return updatedProgress;
  }

  async getProgressByUserId(userId: string): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async getProgressByUserAndExercise(userId: string, exerciseId: string): Promise<Progress | null> {
    return Array.from(this.progress.values()).find(p => 
      p.userId === userId && p.exerciseId === exerciseId
    ) || null;
  }

  async deleteProgress(id: string): Promise<boolean> {
    return this.progress.delete(id);
  }

  async deleteProgressByUserId(userId: string): Promise<number> {
    let deletedCount = 0;
    for (const [id, progress] of this.progress.entries()) {
      if (progress.userId === userId) {
        this.progress.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

export const progressService = new ProgressService();
