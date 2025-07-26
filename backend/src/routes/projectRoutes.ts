import { Router } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth.js';
import projectService from '../services/projectService.js';

const router = Router();

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name_required' });
  const project = await projectService.create(req.userId, { name, description });
  res.status(201).json(project);
});

router.get('/', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const projects = await projectService.list(req.userId);
  res.json(projects);
});

router.get('/:id', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const id = Number(req.params.id);
  const project = await projectService.get(req.userId, id);
  if (!project) return res.status(404).json({ error: 'not_found' });
  res.json(project);
});

router.put('/:id', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const id = Number(req.params.id);
  const project = await projectService.update(req.userId, id, req.body);
  if (!project) return res.status(404).json({ error: 'not_found' });
  res.json(project);
});

router.delete('/:id', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const id = Number(req.params.id);
  const ok = await projectService.remove(req.userId, id);
  if (!ok) return res.status(404).json({ error: 'not_found' });
  res.json({ deleted: true });
});

export default router;
