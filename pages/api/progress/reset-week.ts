import { NextApiRequest, NextApiResponse } from 'next';
import { githubDb } from '../../../src/services/githubDatabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, weekNumber } = req.body;

    if (!userId || !weekNumber) {
      return res.status(400).json({ message: 'User ID and Week Number are required' });
    }

    // First, get all exercises for the specified week
    const exerciseRecords = await githubDb.getWorkoutsByWeek(weekNumber);
    const exerciseIds = exerciseRecords.map(record => record.id);

    // Then get all progress records for the user that match these exercise IDs
    const allProgressRecords = await githubDb.getProgressByUserId(userId);
    const progressRecords = allProgressRecords.filter(record => 
      exerciseIds.includes(record.exerciseId)
    );

    // Delete the progress records
    for (const record of progressRecords) {
      await githubDb.deleteProgress(record.id);
    }

    return res.status(200).json({ message: 'Week progress reset successfully' });
  } catch (error) {
    console.error('Error resetting week progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 