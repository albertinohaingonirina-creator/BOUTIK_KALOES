-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'CAISSIER', 'MAGASINIER');

-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('DEPOT', 'BOUTIQUE', 'REVENDEUR');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('EN_ATTENTE', 'PAYEE', 'REMBOURSEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ESPECES', 'MVOLA', 'CARTE_BANCAIRE', 'CHEQUE', 'VIREMENT', 'MIXTE');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTREE_PRODUCTION', 'TRANSFERT_ENVOI', 'TRANSFERT_RECEPTION', 'VENTE', 'GIFTING', 'AJUSTEMENT_INVENTAIRE');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('BROUILLON', 'EXPEDIE', 'EN_TRANSIT', 'RECEPTIONNE', 'ANNULE');

-- CreateEnum
CREATE TYPE "AuditFrequency" AS ENUM ('JOURNALIER', 'HEBDOMADAIRE', 'MENSUEL', 'TRIMESTRIEL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "codePin" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CAISSIER',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "magasinId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "StoreType" NOT NULL DEFAULT 'BOUTIQUE',
    "adresse" TEXT,
    "telephone" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emplacement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zone" TEXT,
    "magasinId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Emplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorieId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "ugs" TEXT NOT NULL,
    "codeBarre" TEXT,
    "taille" TEXT,
    "couleur" TEXT,
    "prixVente" DOUBLE PRECISION NOT NULL,
    "coutAchat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 5,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "magasinId" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "emplacementId" TEXT,
    "quantite" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "remarque" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "pourcentage" DOUBLE PRECISION NOT NULL,
    "isGifting" BOOLEAN NOT NULL DEFAULT false,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "numeroTicket" TEXT NOT NULL,
    "magasinId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "customerId" TEXT,
    "sousTotal" DOUBLE PRECISION NOT NULL,
    "remiseTotale" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNet" DOUBLE PRECISION NOT NULL,
    "statut" "OrderStatus" NOT NULL DEFAULT 'PAYEE',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "remise" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sousTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "methode" "PaymentMethod" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "destId" TEXT NOT NULL,
    "expediteurId" TEXT NOT NULL,
    "statut" "TransferStatus" NOT NULL DEFAULT 'BROUILLON',
    "dateEnvoi" TIMESTAMP(3),
    "dateRecep" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL,
    "transfertId" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "MovementType" NOT NULL,
    "varianteId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "sourceId" TEXT,
    "destId" TEXT,
    "refPiece" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAudit" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "magasinId" TEXT NOT NULL,
    "auditeurId" TEXT NOT NULL,
    "frequence" "AuditFrequency" NOT NULL,
    "cloture" BOOLEAN NOT NULL DEFAULT false,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateCloture" TIMESTAMP(3),

    CONSTRAINT "InventoryAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAuditItem" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "varianteId" TEXT NOT NULL,
    "stockTheorique" INTEGER NOT NULL,
    "stockReel" INTEGER NOT NULL,
    "ecart" INTEGER NOT NULL,
    "valeurEcartMGA" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InventoryAuditItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Emplacement_magasinId_code_key" ON "Emplacement"("magasinId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_nom_key" ON "Category"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_ugs_key" ON "ProductVariant"("ugs");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_codeBarre_key" ON "ProductVariant"("codeBarre");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_magasinId_varianteId_key" ON "Stock"("magasinId", "varianteId");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_nom_key" ON "Discount"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Order_numeroTicket_key" ON "Order"("numeroTicket");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransfer_reference_key" ON "StockTransfer"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryAudit_reference_key" ON "InventoryAudit"("reference");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emplacement" ADD CONSTRAINT "Emplacement_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "Emplacement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_destId_fkey" FOREIGN KEY ("destId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_transfertId_fkey" FOREIGN KEY ("transfertId") REFERENCES "StockTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_destId_fkey" FOREIGN KEY ("destId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAudit" ADD CONSTRAINT "InventoryAudit_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAudit" ADD CONSTRAINT "InventoryAudit_auditeurId_fkey" FOREIGN KEY ("auditeurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAuditItem" ADD CONSTRAINT "InventoryAuditItem_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "InventoryAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAuditItem" ADD CONSTRAINT "InventoryAuditItem_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
