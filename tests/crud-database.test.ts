import { describe, it, expect, afterAll } from 'vitest';
import prisma from '../backend/src/lib/prisma';

describe('Audit CRUD Réel PostgreSQL - Base kaloes_db', () => {
  let createdCustomerId: string;

  it('1. CREATE : Doit insérer un vrai client dans PostgreSQL', async () => {
    const newCustomer = await prisma.customer.create({
      data: {
        nom: 'Test Audit Automatisé',
        telephone: '+261340099887',
        email: 'audit@kaloes.com',
        ville: 'Antananarivo',
        remarque: 'Client généré par Vitest'
      }
    });

    expect(newCustomer).toHaveProperty('id');
    expect(newCustomer.nom).toBe('Test Audit Automatisé');
    createdCustomerId = newCustomer.id;
  });

  it('2. READ : Doit relire le client depuis la table Customer', async () => {
    const customer = await prisma.customer.findUnique({
      where: { id: createdCustomerId }
    });

    expect(customer).not.toBeNull();
    expect(customer?.email).toBe('audit@kaloes.com');
  });

  it('3. UPDATE : Doit mettre à jour les coordonnées du client', async () => {
    const updated = await prisma.customer.update({
      where: { id: createdCustomerId },
      data: {
        ville: 'Showroom Centre-Ville',
        remarque: 'Client VIP vérifié'
      }
    });

    expect(updated.ville).toBe('Showroom Centre-Ville');
    expect(updated.remarque).toBe('Client VIP vérifié');
  });

  it('4. DELETE : Doit supprimer le client de test pour laisser la base propre', async () => {
    const deleted = await prisma.customer.delete({
      where: { id: createdCustomerId }
    });

    expect(deleted.id).toBe(createdCustomerId);

    const check = await prisma.customer.findUnique({
      where: { id: createdCustomerId }
    });
    expect(check).toBeNull();
  });

  it('5. STOCK AUDIT : Doit vérifier la présence des 3 magasins réels', async () => {
    const stores = await prisma.store.findMany();
    expect(stores.length).toBeGreaterThanOrEqual(3);

    const storeTypes = stores.map(s => s.type);
    expect(storeTypes).toContain('DEPOT');
    expect(storeTypes).toContain('BOUTIQUE');
    expect(storeTypes).toContain('REVENDEUR');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});