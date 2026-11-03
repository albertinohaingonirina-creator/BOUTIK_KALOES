import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const router = Router();
const JWT_SECRET = process.env['JWT_SECRET'] || 'kaloes_secret_key_production_2026_secured';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      res.status(400).json({ error: 'Identifiants incomplets' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { magasin: true }
    });

    if (!user || !user.actif) {
      res.status(401).json({ error: 'Compte inexistant ou inactif' });
      return;
    }

    const match = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!match) {
      res.status(401).json({ error: 'Mot de passe incorrect' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, magasinId: user.magasinId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        avatar: user.avatar,
        role: user.role,
        magasin: user.magasin
      }
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
