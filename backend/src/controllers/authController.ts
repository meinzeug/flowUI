import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password required' });
  }
  const exists = await userService.findByUsername(username);
  if (exists) return res.status(400).json({ error: 'user_exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await userService.create({ username, email, password_hash: hash });
  const token = jwt.sign({ user: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const user = await userService.findByUsername(username);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ user: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}
