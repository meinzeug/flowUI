import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password required' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  const exists = await userService.findByUsername(username);
  if (exists) return res.status(400).json({ error: 'user_exists' });
  const emailExists = await userService.findByEmail(email);
  if (emailExists) return res.status(400).json({ error: 'email_exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await userService.create({ username, email, password_hash: hash });
  const token = jwt.sign({ user: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  let user = await userService.findByUsername(username);
  if (!user && username.includes('@')) {
    user = await userService.findByEmail(username);
  }
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ user: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}
