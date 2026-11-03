import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: { commandes: true }
        }
      }
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, telephone, email, adresse, ville, remarque } = req.body;
    if (!nom) {
      res.status(400).json({ error: 'Le nom du client est obligatoire' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        nom,
        telephone: telephone || null,
        email: email || null,
        adresse: adresse || null,
        ville: ville || null,
        remarque: remarque || null
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '');
    const { nom, telephone, email, adresse, ville, remarque } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        nom,
        telephone: telephone || null,
        email: email || null,
        adresse: adresse || null,
        ville: ville || null,
        remarque: remarque || null
      }
    });

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '');
    await prisma.customer.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/import', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers) || customers.length === 0) {
      res.status(400).json({ error: 'Aucun client à importer' });
      return;
    }

    const cleanData = customers
      .filter((c: any) => c.nom && c.nom.trim() !== '')
      .map((c: any) => ({
        nom: c.nom.trim(),
        email: c.email ? c.email.trim() : null,
        telephone: c.telephone ? c.telephone.trim() : null,
        adresse: c.adresse ? c.adresse.trim() : null,
        ville: c.ville ? c.ville.trim() : null,
        remarque: c.remarque ? c.remarque.trim() : null
      }));

    let count = 0;
    for (const data of cleanData) {
      await prisma.customer.create({ data }).catch((err) => {
        console.error('Import error:', err);
      });
      count++;
    }

    res.status(201).json({ count });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
