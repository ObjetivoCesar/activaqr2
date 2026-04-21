-- Script de inicialización para ActivaQR2
-- EJECUTAR EN SUPABASE: SQL Editor > New Query > Paste > Run

-- 1. Crear Tabla de Tenants (Empresas)
CREATE TABLE IF NOT EXISTS public.activaqr2_tenants (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  brand_color text NULL DEFAULT '#2563eb'::text,
  logo_url text NULL,
  whatsapp_number text NULL,
  linked_email text NULL,
  notification_numbers text NULL,
  vcard_name text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activaqr2_tenants_pkey PRIMARY KEY (id)
);

-- 2. Crear Tabla de Unidades (Vehículos)
CREATE TABLE IF NOT EXISTS public.activaqr2_units (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  unit_code text NOT NULL,
  plate text NULL,
  status text NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activaqr2_units_pkey PRIMARY KEY (id),
  CONSTRAINT activaqr2_units_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.activaqr2_tenants (id) ON DELETE CASCADE
);

-- 3. Crear Tabla de Reportes
CREATE TABLE IF NOT EXISTS public.activaqr2_reports (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  source text NOT NULL DEFAULT 'web'::text,
  type text NOT NULL,
  description text NULL,
  is_urgent boolean NULL DEFAULT false,
  status text NULL DEFAULT 'Nuevo'::text,
  ticket_number text NULL,
  media_url text NULL,
  media_type text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone NULL,
  resolved_by text NULL,
  CONSTRAINT activaqr2_reports_pkey PRIMARY KEY (id),
  CONSTRAINT activaqr2_reports_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.activaqr2_tenants (id) ON DELETE CASCADE,
  CONSTRAINT activaqr2_reports_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.activaqr2_units (id) ON DELETE CASCADE
);

-- 4. Activar RLS
ALTER TABLE public.activaqr2_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activaqr2_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activaqr2_reports ENABLE ROW LEVEL SECURITY;

-- 5. Crear Políticas Base (Acceso público de lectura para el frontend y escritura para los reportes de pasajeros)
CREATE POLICY "Lectura pública de tenants" ON public.activaqr2_tenants FOR SELECT USING (true);
CREATE POLICY "Lectura pública de unidades" ON public.activaqr2_units FOR SELECT USING (true);
CREATE POLICY "Lectura pública de reportes" ON public.activaqr2_reports FOR SELECT USING (true);
CREATE POLICY "Pasajeros pueden crear reportes" ON public.activaqr2_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Dashboard puede actualizar reportes" ON public.activaqr2_reports FOR UPDATE USING (true);
CREATE POLICY "Dashboard puede actualizar tenants" ON public.activaqr2_tenants FOR UPDATE USING (true);

-- 6. Insertar Datos Demo (Opcional, para testear)
INSERT INTO public.activaqr2_tenants (id, name, whatsapp_number) 
VALUES ('c1b6a22f-34a4-4cc4-aecf-e5558872f232', 'Transportes Reyes', '593999999999')
ON CONFLICT DO NOTHING;

INSERT INTO public.activaqr2_units (id, tenant_id, unit_code, plate)
VALUES ('7b1dbdd8-fa8e-4ca7-a417-31a89cde9ea9', 'c1b6a22f-34a4-4cc4-aecf-e5558872f232', '001', 'LBB-1234')
ON CONFLICT DO NOTHING;
