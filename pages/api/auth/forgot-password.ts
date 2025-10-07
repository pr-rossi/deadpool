import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { rateLimit } from '../../../utils/rateLimit';
import { githubDb } from '../../../src/services/githubDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Apply rate limiting
    if (!rateLimit(email)) {
      return res.status(429).json({ 
        message: 'Too many password reset attempts. Please try again later.' 
      });
    }

    // Find user by email
    const user = await githubDb.getUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // Update user record with reset token
    await githubDb.updateUser(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      console.log('Sending reset email to:', email);
      
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          resetLink,
          userName: user.name || 'there',
        }),
      });

      console.log('Email API response status:', emailResponse.status);
      console.log('Email API response headers:', Object.fromEntries(emailResponse.headers.entries()));

      let responseData;
      const responseText = await emailResponse.text();
      console.log('Raw email API response:', responseText);
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse email API response:', responseText);
        responseData = { error: 'Invalid response from email service' };
      }

      console.log('Parsed email API response:', responseData);

      if (!emailResponse.ok) {
        console.error('Email API error response:', responseData);
        throw new Error(responseData.error || responseData.message || `Failed to send reset email (Status: ${emailResponse.status})`);
      }

      if (!responseData.success) {
        console.error('Email API returned unsuccessful response:', responseData);
        throw new Error(responseData.error || responseData.message || 'Failed to send reset email');
      }

      console.log('Reset email sent successfully:', responseData);
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Still return success to the user for security
      // but log the error for debugging
    }

    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.'
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 