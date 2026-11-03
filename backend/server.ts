import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import prisma from './src/lib/prisma.js';
import authRoutes from './src/routes/auth.routes.js';
import posRoutes from './src/routes/pos.routes.js';
import userRoutes from './src/routes/user.routes.js';
import customerRoutes from './src/routes/customer.routes.js';
import logRoutes, { inMemoryAuditLogs } from './src/routes/log.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distFolder = join(__dirname, '../dist/app/browser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const dureeMs = Date.now() - start;
    if (req.originalUrl.startsWith('/api') && !req.originalUrl.includes('/health')) {
      inMemoryAuditLogs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        methode: req.method,
        route: req.originalUrl,
        status: res.statusCode,
        dureeMs,
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1'
      });
      if (inMemoryAuditLogs.length > 500) {
        inMemoryAuditLogs.pop();
      }
    }
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/logs', logRoutes);

app.get('/api/health', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.setHeader('Cache-Control', 'public, max-age=30');
    res.status(200).json({ 
      status: 'UP', 
      database: 'CONNECTED', 
      dbUrl: process.env['DATABASE_URL'] ? 'CONFIGURED' : 'MISSING',
      timestamp: new Date() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'DOWN', 
      database: 'DISCONNECTED', 
      error: String(error) 
    });
  }
});

app.use(express.static(distFolder, { maxAge: '1y' }));

app.use((req: Request, res: Response) => {
  res.sendFile(join(distFolder, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kaloes server running on http://0.0.0.0:${PORT}`);
});
