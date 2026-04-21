-- Script para crear la tabla de usuarios vinculados a tenants
-- EJECUTAR EN SUPABASE: SQL Editor > New Query > Paste > Run

CREATE TABLE IF NOT EXISTS public.activaqr2_users (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activaqr2_users_pkey PRIMARY KEY (id),
  CONSTRAINT activaqr2_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.activaqr2_tenants (id) ON DELETE CASCADE,
  CONSTRAINT activaqr2_users_email_key UNIQUE (email)
);

-- Habilitar RLS
ALTER TABLE public.activaqr2_users ENABLE ROW LEVEL SECURITY;

-- Política de lectura: El usuario puede ver su propia información
-- Basado en el email del JWT de Supabase
CREATE POLICY "Usuarios pueden ver su propia data" ON public.activaqr2_users 
FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Insertar usuario administrador inicial para pruebas (Opcional)
-- IMPORTANTE: Cambiar el tenant_id por uno real de tu tabla activaqr2_tenants
-- INSERT INTO public.activaqr2_users (email, tenant_id, role) 
-- VALUES ('reyescesarenloja@gmail.com', 'TU_TENANT_ID_AQUÍ', 'admin');
