import { createUnit } from './unit-actions';
import { supabase } from '@/lib/supabase';
import { getSessionTenantId } from '@/lib/dal';

// Mocks
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('@/lib/dal', () => ({
  getSessionTenantId: jest.fn(),
}));

jest.mock('resend');

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Unit Actions Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prevent creation if unit limit is reached', async () => {
    const tenantId = 'tenant-limit-test';
    (getSessionTenantId as jest.Mock).mockResolvedValue(tenantId);

    // Mock tenant plan: max 1 unit
    (supabase.from('activaqr2_tenants').select('*').eq().single as jest.Mock).mockResolvedValue({
      data: { max_units: 1, subscription_status: 'active' },
      error: null
    });

    // Mock current units: 1 (limit reached)
    // Here we need to make sure the call to units returns 1
    // Since everything is mocked to return 'this', we distinguish by implementation
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
       if (table === 'activaqr2_units') {
         return {
           select: jest.fn().mockReturnThis(),
           eq: jest.fn().mockResolvedValue({ count: 1, error: null })
         };
       }
       return supabase; // returns the default mock for other tables
    });

    const result = await createUnit({ placa: 'TEST123', unit_number: '101' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Límite de unidades');
  });

  it('should allow creation if limit is not reached', async () => {
    const tenantId = 'tenant-ok-test';
    (getSessionTenantId as jest.Mock).mockResolvedValue(tenantId);

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
       if (table === 'activaqr2_tenants') {
         return {
           select: jest.fn().mockReturnThis(),
           eq: jest.fn().mockReturnThis(),
           single: jest.fn().mockResolvedValue({
             data: { max_units: 10, subscription_status: 'active' },
             error: null
           })
         };
       }
       if (table === 'activaqr2_units') {
         return {
           select: jest.fn().mockReturnThis(),
           eq: jest.fn().mockResolvedValue({ count: 2, error: null }),
           insert: jest.fn().mockResolvedValue({ error: null })
         };
       }
       return supabase;
    });

    const result = await createUnit({ placa: 'NEW999', unit_number: '202' });

    expect(result.success).toBe(true);
  });
});
