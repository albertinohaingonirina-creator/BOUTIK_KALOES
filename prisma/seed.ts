import { PrismaClient, Role, StoreType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockTransferItem.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryAuditItem.deleteMany();
  await prisma.inventoryAudit.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.emplacement.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  const depot = await prisma.store.create({
    data: {
      nom: 'Magasin Local (Dépôt Principal)',
      type: StoreType.DEPOT,
      adresse: 'Zone Industrielle',
      telephone: '+261340000001'
    }
  });

  const boutique = await prisma.store.create({
    data: {
      nom: 'Boutique Showroom',
      type: StoreType.BOUTIQUE,
      adresse: 'Centre-Ville',
      telephone: '+261340000002'
    }
  });

  const revendeur = await prisma.store.create({
    data: {
      nom: 'Revendeur Analakely',
      type: StoreType.REVENDEUR,
      adresse: 'Analakely',
      telephone: '+261340000003'
    }
  });

  const empDepotSacs = await prisma.emplacement.create({
    data: { code: 'DEP-A-01-NIV1', zone: 'Zone Sacs', magasinId: depot.id }
  });

  const empDepotPaniers = await prisma.emplacement.create({
    data: { code: 'DEP-A-02-NIV1', zone: 'Zone Paniers', magasinId: depot.id }
  });

  const empDepotChapeaux = await prisma.emplacement.create({
    data: { code: 'DEP-B-01-NIV2', zone: 'Zone Chapeaux', magasinId: depot.id }
  });

  const empBoutiqueRayon = await prisma.emplacement.create({
    data: { code: 'BOU-RAY-01', zone: 'Rayon Principal', magasinId: boutique.id }
  });

  const empBoutiqueVitrine = await prisma.emplacement.create({
    data: { code: 'BOU-VIT-01', zone: 'Vitrine Exposition', magasinId: boutique.id }
  });

  const hashPassword = await bcrypt.hash('Kaloes2026!', 10);

  const adminUser = await prisma.user.create({
    data: {
      nom: 'Direction Kaloes',
      email: 'direction@kaloes.com',
      motDePasse: hashPassword,
      codePin: '1234',
      role: Role.ADMIN,
      magasinId: boutique.id
    }
  });

  const managerUser = await prisma.user.create({
    data: {
      nom: 'Responsable Showroom',
      email: 'showroom@kaloes.com',
      motDePasse: hashPassword,
      codePin: '0000',
      role: Role.MANAGER,
      magasinId: boutique.id
    }
  });

  await prisma.user.create({
    data: {
      nom: 'Caissière Showroom',
      email: 'caisse@kaloes.com',
      motDePasse: hashPassword,
      codePin: '1111',
      role: Role.CAISSIER,
      magasinId: boutique.id
    }
  });

  await prisma.user.create({
    data: {
      nom: 'Gestionnaire Dépôt',
      email: 'depot@kaloes.com',
      motDePasse: hashPassword,
      codePin: '2222',
      role: Role.MAGASINIER,
      magasinId: depot.id
    }
  });

  const catSacs = await prisma.category.create({ data: { nom: 'Sacs' } });
  const catPaniers = await prisma.category.create({ data: { nom: 'Paniers' } });
  const catChapeaux = await prisma.category.create({ data: { nom: 'Chapeaux' } });
  const catPochettes = await prisma.category.create({ data: { nom: 'Pochettes' } });
  const catCeintures = await prisma.category.create({ data: { nom: 'Ceintures' } });

  const prodAnakao = await prisma.product.create({
    data: { nom: 'Anakao', description: 'Sac artisanal en raphia haut de gamme', categorieId: catSacs.id }
  });

  const prodTsiky = await prisma.product.create({
    data: { nom: 'Tsiky', description: 'Cabas moderne tressé à la main', categorieId: catSacs.id }
  });

  const prodAndao = await prisma.product.create({
    data: { nom: 'Andao', description: 'Sac besace raphia et cuir', categorieId: catSacs.id }
  });

  const prodPauline = await prisma.product.create({
    data: { nom: 'Pauline', description: 'Sac bandoulière compact de créateur', categorieId: catSacs.id }
  });

  const varAnakaoCafeL = await prisma.productVariant.create({
    data: { produitId: prodAnakao.id, ugs: '10175', taille: 'L', couleur: 'Café', prixVente: 1200000, coutAchat: 650000, seuilAlerte: 4 }
  });

  const varAnakaoCafeM = await prisma.productVariant.create({
    data: { produitId: prodAnakao.id, ugs: '10370', taille: 'M', couleur: 'Café', prixVente: 980000, coutAchat: 520000, seuilAlerte: 5 }
  });

  const varAnakaoNoirL = await prisma.productVariant.create({
    data: { produitId: prodAnakao.id, ugs: '10180', taille: 'L', couleur: 'Noir', prixVente: 1200000, coutAchat: 650000, seuilAlerte: 3 }
  });

  const varAnakaoNoirM = await prisma.productVariant.create({
    data: { produitId: prodAnakao.id, ugs: '10398', taille: 'M', couleur: 'Noir', prixVente: 980000, coutAchat: 520000, seuilAlerte: 5 }
  });

  const varTsikyCitronM = await prisma.productVariant.create({
    data: { produitId: prodTsiky.id, ugs: '10401', taille: 'M', couleur: 'Citron', prixVente: 882000, coutAchat: 480000, seuilAlerte: 4 }
  });

  const varTsikyTheL = await prisma.productVariant.create({
    data: { produitId: prodTsiky.id, ugs: '10178', taille: 'L', couleur: 'Thé', prixVente: 1080000, coutAchat: 590000, seuilAlerte: 3 }
  });

  const varAndaoNatM = await prisma.productVariant.create({
    data: { produitId: prodAndao.id, ugs: '10397', taille: 'M', couleur: 'Naturel', prixVente: 980000, coutAchat: 510000, seuilAlerte: 5 }
  });

  const varPaulineTaupeM = await prisma.productVariant.create({
    data: { produitId: prodPauline.id, ugs: '10140', taille: 'M', couleur: 'Taupe', prixVente: 924000, coutAchat: 490000, seuilAlerte: 4 }
  });

  await prisma.stock.createMany({
    data: [
      { magasinId: depot.id, varianteId: varAnakaoCafeL.id, emplacementId: empDepotSacs.id, quantite: 35 },
      { magasinId: boutique.id, varianteId: varAnakaoCafeL.id, emplacementId: empBoutiqueRayon.id, quantite: 12 },
      { magasinId: revendeur.id, varianteId: varAnakaoCafeL.id, quantite: 6 },

      { magasinId: depot.id, varianteId: varAnakaoCafeM.id, emplacementId: empDepotSacs.id, quantite: 40 },
      { magasinId: boutique.id, varianteId: varAnakaoCafeM.id, emplacementId: empBoutiqueRayon.id, quantite: 15 },
      { magasinId: revendeur.id, varianteId: varAnakaoCafeM.id, quantite: 8 },

      { magasinId: depot.id, varianteId: varAnakaoNoirL.id, emplacementId: empDepotSacs.id, quantite: 25 },
      { magasinId: boutique.id, varianteId: varAnakaoNoirL.id, emplacementId: empBoutiqueRayon.id, quantite: 9 },

      { magasinId: depot.id, varianteId: varAnakaoNoirM.id, emplacementId: empDepotSacs.id, quantite: 30 },
      { magasinId: boutique.id, varianteId: varAnakaoNoirM.id, emplacementId: empBoutiqueRayon.id, quantite: 14 },

      { magasinId: depot.id, varianteId: varTsikyCitronM.id, emplacementId: empDepotSacs.id, quantite: 28 },
      { magasinId: boutique.id, varianteId: varTsikyCitronM.id, emplacementId: empBoutiqueVitrine.id, quantite: 8 },

      { magasinId: depot.id, varianteId: varTsikyTheL.id, emplacementId: empDepotSacs.id, quantite: 20 },
      { magasinId: boutique.id, varianteId: varTsikyTheL.id, emplacementId: empBoutiqueRayon.id, quantite: 7 },

      { magasinId: depot.id, varianteId: varAndaoNatM.id, emplacementId: empDepotSacs.id, quantite: 32 },
      { magasinId: boutique.id, varianteId: varAndaoNatM.id, emplacementId: empBoutiqueRayon.id, quantite: 11 },

      { magasinId: depot.id, varianteId: varPaulineTaupeM.id, emplacementId: empDepotSacs.id, quantite: 18 },
      { magasinId: boutique.id, varianteId: varPaulineTaupeM.id, emplacementId: empBoutiqueRayon.id, quantite: 6 }
    ]
  });

  await prisma.discount.createMany({
    data: [
      { nom: 'Direction, 100%', pourcentage: 100, isGifting: true, actif: true },
      { nom: 'Export, 100%', pourcentage: 100, isGifting: true, actif: true },
      { nom: 'Employé Kaloes, 50%', pourcentage: 50, isGifting: false, actif: true },
      { nom: 'Dépôt vente, 20%', pourcentage: 20, isGifting: false, actif: true },
      { nom: 'AA , 20%, 20%', pourcentage: 20, isGifting: false, actif: true },
      { nom: 'AA , 30%, 30%', pourcentage: 30, isGifting: false, actif: true },
      { nom: 'Ceintures café coton, 50%', pourcentage: 50, isGifting: false, actif: true }
    ]
  });

  await prisma.customer.createMany({
    data: [
      { nom: 'Stephanie FB', telephone: '+261341112329', remarque: 'Cliente fidèle showroom' },
      { nom: 'Hargreaves Catherine', telephone: '+261320000001', ville: 'Antananarivo' },
      { nom: 'Nina Andrianina', telephone: '0382807270' },
      { nom: 'Mamitiana RC', telephone: '+261340001234' },
      { nom: 'Ntsoa RC', telephone: '+261330005678' },
      { nom: 'Andrianina', telephone: '+261320009999' },
      { nom: 'Zahra Mamode', telephone: '+33782871192', remarque: 'Commande export' },
      { nom: 'SOBEK TNR', telephone: '+261349988776' }
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });