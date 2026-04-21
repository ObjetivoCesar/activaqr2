import { getSessionTenantId, getUnitsByTenant } from './dal';
import { supabase } from './supabase';
import { auth } from '@/auth';

// Mocks
jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('DAL (Data Access Layer) Isolation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSessionTenantId', () => {
    it('should return the tenantId from session if present', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { tenantId: 'test-tenant-123' }
      });

      const id = await getSessionTenantId();
      expect(id).toBe('test-tenant-123');
    });

    it('should throw Unauthorized error if tenantId is missing', async () => {
      (auth as jest.Mock).mockResolvedValue({
        user: { } // no tenantId
      });

      await expect(getSessionTenantId()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUnitsByTenant', () => {
    it('should filter units by the provided tenantId', async () => {
      const tenantId = 'my-secure-tenant';
      await getUnitsByTenant(tenantId);

      expect(supabase.from).toHaveBeenCalledWith('activaqr2_units');
      expect(supabase.eq).toHaveBeenCalledWith('tenant_id', tenantId);
    });
  });
});
