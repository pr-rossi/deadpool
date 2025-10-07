import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { githubDb } from '../../../src/services/githubDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
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

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    await githubDb.updateUser(user.id, {
      password: hashedPassword,
      resetToken: '',
      resetTokenExpiry: '',
    });

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 