import { Router } from 'express';
import userService from '../services/userService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const username = req.user as string;
  const user = await userService.findByUsername(username);
  if (!user) return res.status(404).json({ error: 'not_found' });
  res.json({ user: { id: user.id, username: user.username, email: user.email } });
});

export default router;
