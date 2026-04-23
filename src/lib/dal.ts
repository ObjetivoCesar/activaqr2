import { supabase } from './supabase';
import { auth } from '@/auth';

/**
 * Obtiene el tenantId de la sesión de NextAuth de forma segura.
 * Si no hay sesión o tenantId, lanza un error de "Unauthorized".
 */
export async function getSessionTenantId() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;
  
  if (!tenantId) {
    throw new Error("Unauthorized: No tenant matching session.");
  }
  
  return tenantId as string;
}

/**
 * Obtiene las unidades vinculadas a un tenant específico.
 */
export async function getUnitsByTenant(tenantId: string) {
  return await supabase
    .from('activaqr2_units')
    .select('*, activaqr2_tenants(*)')
    .eq('tenant_id', tenantId)
    .order('unit_code', { ascending: true });
}

/**
 * Obtiene los reportes filtrados por tenant y opcionalmente por estado/urgencia.
 */
export async function getReportsByTenant(tenantId: string, options: { 
  status?: string, 
  is_urgent?: boolean,
  unitId?: string,
  page?: number,
  pageSize?: number 
} = {}) {
  const { status, is_urgent, unitId, page = 1, pageSize = 10 } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('activaqr2_reports')
    .select('*, activaqr2_units!inner(*)', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status && status !== 'todos') {
    query = query.eq('status', status);
  }

  if (is_urgent !== undefined) {
    query = query.eq('is_urgent', is_urgent);
  }

  if (unitId && unitId !== 'all') {
    query = query.eq('unit_id', unitId);
  }

  return await query;
}

/**
 * Obtiene la configuración de branding del tenant.
 */
export async function getTenantConfig(tenantId: string) {
  return await supabase
    .from('activaqr2_tenants')
    .select('*')
    .eq('id', tenantId)
    .single();
}

/**
 * Obtiene un tenant por su slug (buscando dentro del JSON de vcard_name).
 */
export async function getTenantBySlug(slug: string) {
  const { data: tenants, error } = await supabase
    .from('activaqr2_tenants')
    .select('*');

  if (error || !tenants) return { data: null, error };

  const tenant = tenants.find((t: any) => {
    try {
      if (t.vcard_name?.startsWith('{')) {
        const parsed = JSON.parse(t.vcard_name);
        return parsed.slug === slug;
      }
    } catch(e) {}
    return false;
  });

  return { data: tenant || null, error: null };
}

