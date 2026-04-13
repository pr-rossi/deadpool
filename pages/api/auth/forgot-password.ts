import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import sql from '../../../lib/db';
import { rateLimit } from '../../../utils/rateLimit';

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
    const rows = await sql`SELECT airtable_id, email, name FROM users WHERE email = ${email}`;

    if (rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
    }

    const user = rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user record with reset token
    await sql`
      UPDATE users
      SET reset_token = ${resetToken}, reset_token_expiry = ${resetTokenExpiry.toISOString()}
      WHERE airtable_id = ${user.airtable_id}
    `;

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          resetLink,
          userName: user.name || 'there',
        }),
      });

      if (!emailResponse.ok) {
        console.error('Email API error:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
    }

    return res.status(200).json({
      message: 'If an account exists with this email, you will receive password reset instructions.'
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
