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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get all progress records for the user
    const records = await githubDb.getProgressByUserId(userId);

    // Delete all progress records for the user
    for (const record of records) {
      await githubDb.deleteProgress(record.id);
    }

    return res.status(200).json({ message: 'Progress reset successfully' });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 