import { Router } from 'express';
import toolsService from '../services/toolsService.js';

const router = Router();

router.get('/list', async (_req, res) => {
  const list = await toolsService.list();
  res.json(list);
});

export default router;
