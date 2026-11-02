import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  methode: string;
  route: string;
  status: number;
  dureeMs: number;
  ip: string;
  userId?: string;
}

export const inMemoryAuditLogs: AuditEntry[] = [];

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json(inMemoryAuditLogs.slice(0, 100));
});

export default router;