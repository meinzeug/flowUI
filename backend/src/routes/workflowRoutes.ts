import { Router } from 'express';
import workflowService from '../services/workflowService.js';
import { cancelJob } from '../worker.js';
import { verifyToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const list = await workflowService.list(req.userId);
  res.json(list);
});

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const { name, description, steps } = req.body;
  if (!name || !steps) return res.status(400).json({ error: 'invalid_body' });
  const wf = await workflowService.create(req.userId, { name, description, steps });
  res.status(201).json(wf);
});

router.get('/queue', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const queue = await workflowService.listQueue(req.userId);
  res.json(queue);
});

router.get('/queue/:queueId', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const item = await workflowService.getQueueItemDetail(Number(req.params.queueId));
  if (!item || item.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  const { user_id, ...rest } = item;
  res.json(rest);
});

router.get('/queue/:queueId/logs', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const id = Number(req.params.queueId);
  const item = await workflowService.getQueueItemDetail(id);
  if (!item || item.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  const logs = await workflowService.getLogs(id);
  res.json(logs);
});

router.post('/queue/:queueId/cancel', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const item = await workflowService.getQueueItem(Number(req.params.queueId));
  if (!item) return res.status(404).json({ error: 'not_found' });
  const wf = await workflowService.get(item.workflow_id);
  if (!wf || wf.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  await cancelJob(item.id);
  res.json({ cancelled: true });
});

router.get('/:id', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const wf = await workflowService.get(req.params.id);
  if (!wf || wf.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  res.json(wf);
});

router.put('/:id', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const wf = await workflowService.update(req.params.id, req.body);
  if (!wf || wf.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  res.json(wf);
});

router.delete('/:id', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const wf = await workflowService.get(req.params.id);
  if (!wf || wf.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  await workflowService.remove(req.params.id);
  res.json({ deleted: true });
});

router.post('/:id/execute', verifyToken, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'unauthorized' });
  const wf = await workflowService.get(req.params.id);
  if (!wf || wf.user_id !== req.userId) return res.status(404).json({ error: 'not_found' });
  await workflowService.enqueue(req.params.id);
  res.json({ queued: true });
});

export default router;
