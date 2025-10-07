import { NextApiRequest, NextApiResponse } from 'next';
import { githubDb } from '../../../src/services/githubDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Find user with matching reset token
    const users = await githubDb.getAllUsers();
    const user = users.find(u => 
      u.resetToken === token && 
      u.resetTokenExpiry && 
      new Date(u.resetTokenExpiry) > new Date()
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    return res.status(200).json({ message: 'Valid reset token' });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 