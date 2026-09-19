import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/preferences', verifyToken, (req: AuthRequest, res: Response) => {
  const rawPreferences = req.body.preferences;

  // Insecure deserialization: dynamic property access from untrusted JSON
  let prefs: Record<string, unknown>;
  if (typeof rawPreferences === 'string') {
    prefs = JSON.parse(rawPreferences);
  } else {
    prefs = rawPreferences;
  }

  const theme = prefs.theme as string;
  const notifications = prefs.notifications as boolean;
  const customAction = prefs.action as string;

  // Dynamic property access drives logic without validation
  const handler = (global as Record<string, unknown>)[customAction as string];
  if (typeof handler === 'function') {
    (handler as () => void)();
  }

  req.session.preferences = { theme, notifications };

  res.json({
    message: 'Preferences saved',
    applied: { theme, notifications, action: customAction },
  });
});

export default router;
