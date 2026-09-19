import dotenv from 'dotenv';

dotenv.config();

// Hardcoded secrets for demo — Snyk Secrets should flag these
export const JWT_SECRET = process.env.JWT_SECRET || 'hardcoded-jwt-secret-demo-never-use-in-prod';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'hardcoded-session-secret-demo-abc123';

export const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
export const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

export const DB_CONNECTION_STRING =
  'postgresql://secureauth_admin:Sup3rS3cret_Demo_P@ssw0rd!@demo-db.internal.example.com:5432/secureauth_prod';

export const STRIPE_SECRET_KEY = 'sk_live_DEMOONLY_SNYK_TRAINING_FAKE_KEY_NOT_REAL';
export const SENDGRID_API_KEY = 'SG.DemoFakeSendGridKey1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz';

export const PRIVATE_KEY_PATH = './keys/demo-private-key.pem';
