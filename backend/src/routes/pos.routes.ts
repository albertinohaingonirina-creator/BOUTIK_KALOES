import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { MovementType, OrderStatus, PaymentMethod } from '@prisma/client';

const router = Router();

router.get('/movements', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const movements = await prisma.stockMovement.findMany({
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        variante: {
          include: { produit: true }
        },
        source: true,
        dest: true,
        operateur: { select: { nom: true } }
      }
    });
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/movements', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { typeMvt, varianteId, quantite, sourceId, destId, refPiece } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const qte = Number(quantite);

      if (sourceId) {
        await tx.stock.upsert({
          where: { magasinId_varianteId: { magasinId: sourceId, varianteId } },
          update: { quantite: { decrement: qte } },
          create: { magasinId: sourceId, varianteId, quantite: -qte }
        });
      }

      if (destId) {
        await tx.stock.upsert({
          where: { magasinId_varianteId: { magasinId: destId, varianteId } },
          update: { quantite: { increment: qte } },
          create: { magasinId: destId, varianteId, quantite: qte }
        });
      }

      const mvt = await tx.stockMovement.create({
        data: {
          type: typeMvt as MovementType,
          varianteId,
          quantite: qte,
          sourceId: sourceId || null,
          destId: destId || null,
          refPiece: refPiece || `MVT-${Date.now()}`,
          userId
        }
      });

      return mvt;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/stores', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        emplacements: true,
        _count: {
          select: { stocks: true, utilisateurs: true }
        }
      },
      orderBy: { nom: 'asc' }
    });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/catalog', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const magasinId = req.user?.magasinId || (req.query.magasinId as string);

    const categories = await prisma.category.findMany({
      include: {
        produits: {
          include: {
            variantes: {
              include: {
                stocks: {
                  include: {
                    magasin: true,
                    emplacement: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/discounts', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const discounts = await prisma.discount.findMany({
      where: { actif: true },
      orderBy: { pourcentage: 'asc' }
    });
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/customers', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { nom: 'asc' }
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/customers', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, telephone, email, adresse, ville, remarque } = req.body;
    if (!nom) {
      res.status(400).json({ error: 'Le nom du client est requis' });
      return;
    }

    const customer = await prisma.customer.create({
      data: { nom, telephone, email, adresse, ville, remarque }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/checkout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const {
      magasinId,
      customerId,
      items,
      remiseTotale,
      paiements,
      isGifting
    } = req.body;

    if (!magasinId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Panier ou point de vente manquant' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      let sousTotal = 0;
      for (const item of items) {
        sousTotal += Number(item.prixUnitaire) * Number(item.quantite) - (Number(item.remise) || 0);
      }

      const totalNet = Math.max(0, sousTotal - (Number(remiseTotale) || 0));
      const ticketNumber = `#3-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = await tx.order.create({
        data: {
          numeroTicket: ticketNumber,
          magasinId,
          utilisateurId: userId,
          customerId: customerId || null,
          sousTotal,
          remiseTotale: Number(remiseTotale) || 0,
          totalNet,
          statut: OrderStatus.PAYEE,
          elements: {
            create: items.map((i: any) => ({
              varianteId: i.varianteId,
              quantite: Number(i.quantite),
              prixUnitaire: Number(i.prixUnitaire),
              remise: Number(i.remise) || 0,
              sousTotal: Number(i.prixUnitaire) * Number(i.quantite) - (Number(i.remise) || 0)
            }))
          },
          paiements: {
            create: (paiements || []).map((p: any) => ({
              methode: p.methode as PaymentMethod,
              montant: Number(p.montant),
              reference: p.reference || null
            }))
          }
        },
        include: {
          elements: true,
          paiements: true,
          client: true
        }
      });

      for (const item of items) {
        await tx.stock.upsert({
          where: {
            magasinId_varianteId: {
              magasinId,
              varianteId: item.varianteId
            }
          },
          update: {
            quantite: { decrement: Number(item.quantite) }
          },
          create: {
            magasinId,
            varianteId: item.varianteId,
            quantite: -Number(item.quantite)
          }
        });

        await tx.stockMovement.create({
          data: {
            type: isGifting ? MovementType.GIFTING : MovementType.VENTE,
            varianteId: item.varianteId,
            quantite: Number(item.quantite),
            sourceId: magasinId,
            refPiece: ticketNumber,
            userId
          }
        });
      }

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/inventory', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const { magasinId, frequence, date, lignes } = req.body;
    const ref = `INV-${Date.now()}`;

    const audit = await prisma.inventoryAudit.create({
      data: {
        reference: ref,
        magasinId,
        auditeurId: userId,
        frequence,
        cloture: true,
        dateCloture: new Date(date || Date.now()),
        lignes: {
          create: (lignes || []).map((l: any) => ({
            varianteId: l.id_article,
            stockTheorique: Number(l.theorique),
            stockReel: Number(l.reel),
            ecart: Number(l.ecart),
            valeurEcartMGA: Number(l.valeur_ecart)
          }))
        }
      }
    });

    res.status(201).json(audit);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/dashboard-kpis', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalArticles, totalMagasins, totalClients, totalOrders] = await Promise.all([
      prisma.productVariant.count(),
      prisma.store.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        _sum: { totalNet: true },
        _count: { id: true }
      })
    ]);

    res.status(200).json({
      totalArticles,
      totalMagasins,
      totalClients,
      totalCommandes: totalOrders._count.id,
      chiffreAffairesMGA: totalOrders._sum.totalNet || 0
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/tickets', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const magasinId = req.user?.magasinId || (req.query.magasinId as string);

    const orders = await prisma.order.findMany({
      where: magasinId ? { magasinId } : {},
      orderBy: { creeLe: 'desc' },
      take: 50,
      include: {
        client: true,
        utilisateur: { select: { nom: true } },
        elements: {
          include: {
            variante: {
              include: { produit: true }
            }
          }
        },
        paiements: true
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});


router.post('/articles', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, ugs, categorie, prix_vente, alerte_stock } = req.body;

    // Cherche ou crée la catégorie
    let cat = await prisma.category.findUnique({ where: { nom: categorie } });
    if (!cat) {
      cat = await prisma.category.create({ data: { nom: categorie } });
    }

    // Crée le Produit puis sa Variante (UGS)
    const result = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: { nom, categorieId: cat.id }
      });

      const variant = await tx.productVariant.create({
        data: {
          produitId: prod.id,
          ugs,
          prixVente: Number(prix_vente),
          seuilAlerte: Number(alerte_stock)
        }
      });

      return variant;
    });

    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.put('/articles/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // C'est l'ID de la Variante (ID_ARTICLE côté front)
    const { nom, ugs, categorie, prix_vente, alerte_stock } = req.body;

    // 1. Mettre à jour la Variante
    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: {
        ugs,
        prixVente: Number(prix_vente),
        seuilAlerte: Number(alerte_stock)
      },
      include: { produit: true }
    });

    // 2. Mettre à jour le nom du Produit associé
    if (updatedVariant.produit.nom !== nom) {
      await prisma.product.update({
        where: { id: updatedVariant.produitId },
        data: { nom }
      });
    }

    // 3. Mettre à jour la catégorie si changée
    const cat = await prisma.category.findUnique({ where: { nom: categorie } });
    if (cat && updatedVariant.produit.categorieId !== cat.id) {
      await prisma.product.update({
        where: { id: updatedVariant.produitId },
        data: { categorieId: cat.id }
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});



export default router;