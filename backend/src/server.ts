import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import posRoutes from './routes/pos.routes.js';
import userRoutes from './routes/user.routes.js';
import customerRoutes from './routes/customer.routes.js';
import logRoutes, { inMemoryAuditLogs } from './routes/log.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

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
      dbUrl: process.env.DATABASE_URL ? 'CONFIGURED' : 'MISSING',
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

app.listen(PORT, () => {
  console.log(`Serveur Kaloes Backend opérationnel sur http://localhost:${PORT}`);
});