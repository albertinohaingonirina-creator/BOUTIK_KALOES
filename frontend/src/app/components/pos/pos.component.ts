import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface CartItem {
  varianteId: string;
  nomProduit: string;
  taille: string;
  couleur: string;
  ugs: string;
  prixUnitaire: number;
  quantite: number;
  remise: number;
  sousTotal: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html'
})
export class PosComponent implements OnInit {
  categories: any[] = [];
  selectedCategory: string = 'TOUT';
  searchTerm: string = '';
  
  cart: CartItem[] = [];
  customers: any[] = [];
  selectedCustomer: any = null;
  customerSearchTerm: string = '';
  
  discounts: any[] = [];
  appliedDiscounts: any[] = [];
  
  selectedProductForVariants: any = null;
  
  isVariantModalOpen: boolean = false;
  isCustomerModalOpen: boolean = false;
  isDiscountModalOpen: boolean = false;
  isPaymentModalOpen: boolean = false;
  isReceiptModalOpen: boolean = false;
  
  paymentMethod: string = 'ESPECES';
  amountGiven: number = 0;
  paymentReference: string = '';

  get montantRecu(): number {
    return this.amountGiven;
  }
  set montantRecu(val: number) {
    this.amountGiven = val;
  }

  getMonnaieARendre(): number {
    return this.getChangeAmount();
  }

  validateCheckout(): void {
    this.processPayment();
  }

  getLeatherColor(couleur: string): string {
    const c = (couleur || '').toLowerCase();
    if (c.includes('café') || c.includes('cafe')) return '#4A2E18';
    if (c.includes('noir')) return '#1A1A1A';
    if (c.includes('citron')) return '#D4AF37';
    if (c.includes('thé') || c.includes('the')) return '#B87333';
    if (c.includes('naturel')) return '#E8DCC4';
    if (c.includes('taupe')) return '#8C7D70';
    if (c.includes('cognac')) return '#9E4714';
    return '#8D6E63';
  }
  
  lastReceipt: any = null;
  isLoading: boolean = false;
  currentUser: any = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.apiService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCatalog();
    this.loadCustomers();
    this.loadDiscounts();
  }

  loadCatalog(): void {
    this.isLoading = true;
    this.apiService.getPosCatalog().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) this.router.navigate(['/login']);
      }
    });
  }

  loadCustomers(): void {
    this.apiService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data || [];
      },
      error: (err) => {
        if (err.status === 401) this.router.navigate(['/login']);
      }
    });
  }

  loadDiscounts(): void {
    this.apiService.getDiscounts().subscribe({
      next: (data) => {
        this.discounts = data || [];
      },
      error: (err) => {
        if (err.status === 401) this.router.navigate(['/login']);
      }
    });
  }

  get filteredProducts(): any[] {
    let prods: any[] = [];
    this.categories.forEach(c => {
      if (this.selectedCategory === 'TOUT' || c.nom === this.selectedCategory) {
        (c.produits || []).forEach((p: any) => {
          prods.push({ ...p, categorieNom: c.nom });
        });
      }
    });

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      prods = prods.filter(p => 
        p.nom.toLowerCase().includes(term) ||
        (p.variantes || []).some((v: any) => v.ugs.toLowerCase().includes(term))
      );
    }
    return prods;
  }

  get filteredCustomers(): any[] {
    if (!this.customerSearchTerm.trim()) return this.customers;
    const term = this.customerSearchTerm.toLowerCase();
    return this.customers.filter(c => 
      c.nom.toLowerCase().includes(term) || 
      (c.telephone && c.telephone.toLowerCase().includes(term))
    );
  }

  openVariantSelection(prod: any): void {
    this.selectedProductForVariants = prod;
    this.isVariantModalOpen = true;
  }

  closeVariantModal(): void {
    this.selectedProductForVariants = null;
    this.isVariantModalOpen = false;
  }

  addVariantToCart(variant: any): void {
    const existingIndex = this.cart.findIndex(i => i.varianteId === variant.id);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantite += 1;
      this.recalculateItem(this.cart[existingIndex]);
    } else {
      const newItem: CartItem = {
        varianteId: variant.id,
        nomProduit: this.selectedProductForVariants.nom,
        taille: variant.taille || 'Unique',
        couleur: variant.couleur || 'Standard',
        ugs: variant.ugs,
        prixUnitaire: variant.prixVente,
        quantite: 1,
        remise: 0,
        sousTotal: variant.prixVente
      };
      this.cart.push(newItem);
    }
    this.closeVariantModal();
  }

  updateItemQuantity(index: number, delta: number): void {
    this.cart[index].quantite += delta;
    if (this.cart[index].quantite <= 0) {
      this.cart.splice(index, 1);
    } else {
      this.recalculateItem(this.cart[index]);
    }
  }

  removeItem(index: number): void {
    this.cart.splice(index, 1);
  }

  recalculateItem(item: CartItem): void {
    item.sousTotal = (item.prixUnitaire * item.quantite) - item.remise;
  }

  getSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.prixUnitaire * item.quantite), 0);
  }

  getDiscountTotal(): number {
    const sub = this.getSubtotal();
    return this.appliedDiscounts.reduce((sum, d) => sum + (sub * (d.pourcentage / 100)), 0);
  }

  getTotalNet(): number {
    return Math.max(0, this.getSubtotal() - this.getDiscountTotal());
  }

  getChangeAmount(): number {
    return Math.max(0, this.amountGiven - this.getTotalNet());
  }

  isGiftingSale(): boolean {
    return this.appliedDiscounts.some(d => d.isGifting || d.pourcentage === 100);
  }

  openCustomerModal(): void {
    this.isCustomerModalOpen = true;
  }

  selectCustomer(customer: any): void {
    this.selectedCustomer = customer;
    this.isCustomerModalOpen = false;
  }

  removeCustomer(): void {
    this.selectedCustomer = null;
  }

  openDiscountModal(): void {
    this.isDiscountModalOpen = true;
  }

  toggleDiscount(discount: any): void {
    const idx = this.appliedDiscounts.findIndex(d => d.id === discount.id);
    if (idx > -1) {
      this.appliedDiscounts.splice(idx, 1);
    } else {
      this.appliedDiscounts.push(discount);
    }
  }

  isDiscountApplied(discount: any): boolean {
    return this.appliedDiscounts.some(d => d.id === discount.id);
  }

  openPaymentModal(): void {
    this.amountGiven = this.getTotalNet();
    this.isPaymentModalOpen = true;
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen = false;
  }

  processPayment(): void {
    if (this.cart.length === 0) return;

    this.isLoading = true;
    const payload = {
      magasinId: this.currentUser?.magasin?.id,
      customerId: this.selectedCustomer?.id || null,
      items: this.cart.map(item => ({
        varianteId: item.varianteId,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        remise: item.remise
      })),
      remiseTotale: this.getDiscountTotal(),
      isGifting: this.isGiftingSale(),
      paiements: [
        {
          methode: this.paymentMethod,
          montant: this.getTotalNet(),
          reference: this.paymentReference || null
        }
      ]
    };

    this.apiService.checkout(payload).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.lastReceipt = {
          ticket: order.numeroTicket,
          date: new Date(),
          vendeur: this.currentUser?.nom,
          client: this.selectedCustomer?.nom || 'Client de passage',
          items: [...this.cart],
          sousTotal: this.getSubtotal(),
          remise: this.getDiscountTotal(),
          total: this.getTotalNet(),
          methode: this.paymentMethod,
          montantRecu: this.amountGiven,
          monnaieRendue: this.getChangeAmount()
        };
        this.closePaymentModal();
        this.isReceiptModalOpen = true;
        this.clearCart();
      },
      error: () => {
        this.isLoading = false;
        this.closePaymentModal();
      }
    });
  }

  clearCart(): void {
    this.cart = [];
    this.selectedCustomer = null;
    this.appliedDiscounts = [];
    this.paymentReference = '';
    this.amountGiven = 0;
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen = false;
    this.lastReceipt = null;
  }
}