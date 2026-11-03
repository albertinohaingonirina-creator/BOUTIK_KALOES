import { Router, Response } from 'express';
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
        avatar: true,
        telephone: true,
        actif: true,
        magasinId: true,
        magasin: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        }
      }
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }
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
    const { nom, email, telephone, avatar } = req.body;
    if (!nom || !email) {
      res.status(400).json({ error: 'Le nom et l\'email sont requis' });
      return;
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        nom,
        email,
        telephone: telephone || null,
        avatar: avatar || null
      },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        avatar: true,
        telephone: true,
        actif: true,
        magasinId: true,
        magasin: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        }
      }
    });
    res.status(200).json({ success: true, user: updated });
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
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    if (!ancienMotDePasse || !nouveauMotDePasse) {
      res.status(400).json({ error: 'L\'ancien et le nouveau mot de passe sont obligatoires' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }
    const isValid = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!isValid) {
      res.status(400).json({ error: 'L\'ancien mot de passe renseigné est incorrect' });
      return;
    }
    const newHash = await bcrypt.hash(nouveauMotDePasse, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { motDePasse: newHash }
    });
    res.status(200).json({ success: true, message: 'Mot de passe modifié avec succès' });
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
        avatar: true,
        telephone: true
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
    const { nom, email, motDePasse, role, magasinId, telephone, avatar } = req.body;
    
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
        magasinId: magasinId ? String(magasinId) : null,
        telephone: telephone || null,
        avatar: avatar || null
      }
    });
    
    res.status(201).json({ success: true, id: user.id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '');
    const { nom, email, motDePasse, role, magasinId, telephone, avatar } = req.body;

    const updateData: any = {
      nom,
      email,
      role,
      magasinId: magasinId ? String(magasinId) : null
    };

    if (telephone !== undefined) updateData.telephone = telephone;
    if (avatar !== undefined) updateData.avatar = avatar;

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
