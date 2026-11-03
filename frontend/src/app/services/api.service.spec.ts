import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService - Audit Unitaire Kaloès', () => {
  let service: ApiService;
  let httpMock: any;

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'kaloes_token') return 'fake-jwt-token-12345';
      return null;
    });

    service = new ApiService(httpMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Le service doit s\'instancier correctement', () => {
    expect(service).toBeTruthy();
  });

  it('2. [CRM] Récupération des clients via GET /customers', () => {
    const mockCustomers = [
      { id: '1', nom: 'Stephanie FB' },
      { id: '2', nom: 'Maison Kaloès' }
    ];

    httpMock.get.mockReturnValue(of(mockCustomers));

    service.getCustomersList().subscribe(data => {
      expect(data).toEqual(mockCustomers);
      expect(data.length).toBe(2);
    });

    expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/customers`);
  });

  it('3. [POS] Récupération du catalogue filtré par magasin', () => {
    const magId = 'MAG-02';
    httpMock.get.mockReturnValue(of([]));

    service.getPosCatalog(magId).subscribe();

    expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/pos/catalog?magasinId=${magId}`);
  });

  it('4. [WMS] Enregistrement d\'un transfert de stock', () => {
    const payload = {
      typeMvt: 'TRANSFERT',
      varianteId: 'var-123',
      quantite: 5,
      sourceId: 'MAG-01',
      destId: 'MAG-02'
    };

    httpMock.post.mockReturnValue(of({ success: true }));

    service.addMouvement(payload).subscribe();

    expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/pos/movements`, payload);
  });

  it('5. [AUTH] Déconnexion et purge de session', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    service.logout();

    expect(removeItemSpy).toHaveBeenCalledWith('kaloes_token');
    expect(removeItemSpy).toHaveBeenCalledWith('kaloes_user');
  });
});