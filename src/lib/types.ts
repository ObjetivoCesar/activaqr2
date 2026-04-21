export interface Tenant {
  id: string;
  name: string;
  brand_color: string | null;
  logo_url: string | null;
  whatsapp_number: string | null;
  linked_email: string | null;
  notification_numbers: string | null;
  vcard_name: string | null;
  // SaaS Multi-Tier fields
  plan: 'solo' | 'empresa_10' | 'empresa_50';
  max_units: number;
  monthly_price: number;
  subscription_status: 'active' | 'trial' | 'expired' | 'suspended';
  subscription_start: string;
  subscription_end: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  tenant_id: string | null;
  role: 'super_admin' | 'tenant_admin';
  created_at: string;
}

export interface Unit {
  id: string;
  tenant_id: string;
  unit_code: string;
  plate: string | null;
  status: string;
  owner_name?: string | null;
  driver_name?: string | null;
  driver_id?: string | null;
  notification_number?: string | null;
  created_at: string;
  // Supabase inner join
  activaqr2_tenants?: Tenant;
}

export interface Report {
  id: string;
  tenant_id: string;
  unit_id: string;
  source: string;
  type: string;
  description: string | null;
  is_urgent: boolean;
  status: string;
  ticket_number: string | null;
  media_url: string | null;
  media_type: string | null;
  rating?: number | null;
  location_lat?: number | null;
  location_lng?: number | null;
  metadata?: any;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  
  // Supabase joins
  activaqr2_units?: Unit;
  activaqr2_tenants?: Tenant;
}
