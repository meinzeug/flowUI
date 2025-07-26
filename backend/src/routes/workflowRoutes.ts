import { Router } from 'express';
import workflowService from '../services/workflowService.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(workflowService.list());
});

router.post('/', (req, res) => {
  const { name, description, steps } = req.body;
  if (!name || !steps) return res.status(400).json({ error: 'invalid_body' });
  const wf = workflowService.create({ name, description, steps });
  res.status(201).json(wf);
});

router.get('/:id', (req, res) => {
  const wf = workflowService.get(req.params.id);
  if (!wf) return res.status(404).json({ error: 'not_found' });
  res.json(wf);
});

router.put('/:id', (req, res) => {
  const wf = workflowService.update(req.params.id, req.body);
  if (!wf) return res.status(404).json({ error: 'not_found' });
  res.json(wf);
});

router.delete('/:id', (req, res) => {
  const ok = workflowService.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not_found' });
  res.json({ deleted: true });
});

router.post('/:id/execute', (req, res) => {
  const ok = workflowService.enqueue(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not_found' });
  res.json({ queued: true });
});

export default router;
