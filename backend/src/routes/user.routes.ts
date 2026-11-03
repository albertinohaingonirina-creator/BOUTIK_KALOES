import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        magasinId: true,
        magasin: true
      }
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { nom, email } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { nom, email },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        magasin: true
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.put('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    const match = await bcrypt.compare(oldPassword, user.motDePasse);
    if (!match) {
      res.status(400).json({ error: 'Ancien mot de passe incorrect' });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { motDePasse: hash }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        magasinId: true,
        magasin: true
      },
      orderBy: { nom: 'asc' }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, email, motDePasse, role, magasinId } = req.body;
    if (!nom || !email || !motDePasse) {
      res.status(400).json({ error: 'Champs obligatoires manquants' });
      return;
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await prisma.user.create({
      data: {
        nom,
        email,
        motDePasse: hash,
        role,
        magasinId: magasinId ? String(magasinId) : null
      }
    });

    res.status(201).json({ success: true, id: user.id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, email, motDePasse, role, magasinId } = req.body;

    const updateData: any = {
      nom,
      email,
      role,
      magasinId: magasinId ? String(magasinId) : null
    };

    if (motDePasse && motDePasse.trim() !== '') {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;