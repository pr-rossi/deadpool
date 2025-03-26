import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { ResetPasswordEmail } from '../../../components/emails/ResetPasswordEmail';
import { render } from '@react-email/render';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, resetLink, userName } = req.body;

    console.log('Received email request:', { to, resetLink, userName });

    if (!to || !resetLink) {
      console.error('Missing required fields:', { to, resetLink });
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        error: 'Missing required fields',
        details: { to: !to, resetLink: !resetLink }
      });
    }

    console.log('Starting email send process...');
    console.log('To:', to);
    console.log('Reset link:', resetLink);

    const emailHtml = await render(
      ResetPasswordEmail({
        resetLink,
        userName,
      })
    );

    console.log('Email HTML generated successfully');

    try {
      console.log('Attempting to send email with Resend...');
      console.log('Using Resend API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
      
      const data = await resend.emails.send({
        from: 'Swole <noreply@swole.itsmichaelrossi.com>',
        to,
        subject: 'Reset your password',
        html: emailHtml,
      });

      console.log('Email sent successfully:', data);
      return res.status(200).json({ success: true, data });
    } catch (resendError) {
      console.error('Resend API error:', resendError);
      if (resendError instanceof Error) {
        console.error('Resend error details:', resendError.message);
        console.error('Resend error stack:', resendError.stack);
        if ('code' in resendError) {
          console.error('Resend error code:', (resendError as any).code);
        }
        // Log the full error object
        console.error('Full Resend error:', JSON.stringify(resendError, null, 2));
        return res.status(500).json({ 
          success: false,
          message: 'Failed to send email',
          error: resendError.message,
          code: (resendError as any).code,
          details: resendError
        });
      }
      throw resendError;
    }
  } catch (error) {
    console.error('Error in email handler:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
      // Log the full error object
      console.error('Full error:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send email',
        error: error.message,
        code: (error as any).code,
        details: error
      });
    }
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send email',
      error: 'Unknown error'
    });
  }
} 