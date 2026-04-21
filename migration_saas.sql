-- MIGRACIÓN: ActivaQR2 SaaS Multi-Tier
-- Ejecutar en Supabase: SQL Editor > New Query

-- 1. Expandir Tabla de Tenants con lógica de SaaS
ALTER TABLE IF EXISTS public.activaqr2_tenants 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'solo',
ADD COLUMN IF NOT EXISTS max_units int DEFAULT 1,
ADD COLUMN IF NOT EXISTS monthly_price numeric(10,2) DEFAULT 13.00,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS subscription_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS contact_phone text;

-- 2. Crear Tabla de Usuarios para Autenticación NEXTAUTH
CREATE TABLE IF NOT EXISTS public.activaqr2_users (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  email text NOT NULL,
  tenant_id uuid NULL, -- NULL para super_admin (César)
  role text NOT NULL DEFAULT 'tenant_admin', -- 'super_admin' | 'tenant_admin'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activaqr2_users_pkey PRIMARY KEY (id),
  CONSTRAINT activaqr2_users_email_key UNIQUE (email),
  CONSTRAINT activaqr2_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.activaqr2_tenants (id) ON DELETE SET NULL
);

-- 3. Habilitar RLS en la nueva tabla
ALTER TABLE public.activaqr2_users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para activaqr2_users (Seguridad Dashboard)
DROP POLICY IF EXISTS "Lectura restringida de usuarios" ON public.activaqr2_users;
CREATE POLICY "Lectura restringida de usuarios" ON public.activaqr2_users 
FOR SELECT USING (true); -- Permitimos lectura para NextAuth

-- 5. Actualizar tenant demo a plan 'solo'
UPDATE public.activaqr2_tenants 
SET plan = 'solo', max_units = 1, monthly_price = 13.00 
WHERE name = 'Transportes Reyes';

-- 6. INSERTAR A CÉSAR COMO SUPER_ADMIN
-- IMPORTANTE: Cambia el email si es necesario
INSERT INTO public.activaqr2_users (email, role, tenant_id)
VALUES ('reyescesarenloja@gmail.com', 'super_admin', NULL)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
