import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

router.use(
  '/',
  createProxyMiddleware({
    target: 'http://mcp:3008',
    ws: true,
    changeOrigin: true,
    pathRewrite: { '^/mcp': '' }
  })
);

export default router;
