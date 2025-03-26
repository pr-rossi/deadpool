import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  resetLink: string;
  userName?: string;
}

export const ResetPasswordEmail = ({
  resetLink,
  userName = 'there',
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Preview>Reset your password for Deadpool</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Reset Your Password</Text>
          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            We received a request to reset your password for your Deadpool account.
            Click the button below to create a new password:
          </Text>
          <Link href={resetLink} style={button}>
            Reset Password
          </Link>
          <Text style={paragraph}>
            If you didn't request this password reset, you can safely ignore this email.
            Your password will remain unchanged.
          </Text>
          <Text style={paragraph}>
            This link will expire in 1 hour for security reasons.
          </Text>
          <Text style={paragraph}>
            Best regards,<br />
            The Deadpool Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#000000',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '40px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#ffffff',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#4299e1',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '24px 0',
}; 