import { NextApiRequest, NextApiResponse } from 'next';
import { githubDb } from '../../../src/services/githubDatabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const { userId, exerciseId, completed } = req.body;

      if (!userId || !exerciseId) {
        return res.status(400).json({ message: 'User ID and Exercise ID are required' });
      }

      // Check if progress record already exists
      const existingProgress = await githubDb.getProgressByUserAndExercise(userId, exerciseId);

      if (existingProgress) {
        // Update existing record
        await githubDb.updateProgress(existingProgress.id, {
          completed: completed ? 'checked' : '',
          lastUpdated: new Date().toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        });
      } else {
        // Create new record
        await githubDb.createProgress({
          userId,
          exerciseId,
          completed: completed ? 'checked' : '',
          lastUpdated: new Date().toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        });
      }

      return res.status(200).json({ message: 'Progress updated successfully' });
    } else if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Get all progress records for a user
      const progressRecords = await githubDb.getProgressByUserId(userId);

      const progress = progressRecords.map(record => ({
        exerciseId: record.exerciseId,
        completed: record.completed === 'checked',
        lastUpdated: record.lastUpdated,
      }));

      return res.status(200).json({ progress });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Progress error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 