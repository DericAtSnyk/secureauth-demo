import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { initDatabase } from './db/client';
import { initSchema } from './db/schema';
import { SESSION_SECRET } from './config/secrets';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import adminRoutes from './routes/admin';
import passwordResetRoutes from './routes/password-reset';
import preferencesRoutes from './routes/preferences';

dotenv.config();

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    role?: string;
    preferences?: Record<string, unknown>;
  }
}

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(authRoutes);
app.use(profileRoutes);
app.use(adminRoutes);
app.use(passwordResetRoutes);
app.use(preferencesRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'secureauth-demo' });
});

async function start(): Promise<void> {
  await initDatabase();
  initSchema();

  app.listen(PORT, () => {
    console.log(`SecureAuth Demo running on http://localhost:${PORT}`);
    console.log('WARNING: This is an intentionally vulnerable application for security demos only.');
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

export default app;
