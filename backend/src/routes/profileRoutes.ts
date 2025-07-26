import { Router } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth.js';
import userService from '../services/userService.js';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const user = await userService.findByUsername(req.user);
  if (!user) return res.status(404).json({ error: 'not_found' });
  res.json({ user: { id: user.id, username: user.username, email: user.email } });
});

export default router;
