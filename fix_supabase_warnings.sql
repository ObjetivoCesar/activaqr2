-- Script para solucionar las advertencias de seguridad de Supabase (RLS y Buckets)
-- EJECUTAR EN SUPABASE: SQL Editor > New Query > Paste > Run

-- 1. Eliminar políticas permisivas de ActivaQR2
-- Al usar el SERVICE_ROLE_KEY en los Server Actions (backend), RLS no aplica en el servidor.
-- Por ende, no necesitamos exponer INSERT, UPDATE ni DELETE al público (ANON KEY).
DROP POLICY IF EXISTS "Pasajeros pueden crear reportes" ON public.activaqr2_reports;
DROP POLICY IF EXISTS "Dashboard puede actualizar reportes" ON public.activaqr2_reports;
DROP POLICY IF EXISTS "Dashboard puede actualizar tenants" ON public.activaqr2_tenants;

-- 2. Eliminar políticas permisivas en las tablas antiguas de ActivaQR1
-- Reemplazamos la regla ALL pública con una que requiera estar autenticado en Supabase.
DROP POLICY IF EXISTS "Manage Products" ON public.products;
CREATE POLICY "Manage Products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Manage Tenants" ON public.tenants;
CREATE POLICY "Manage Tenants" ON public.tenants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Solucionar la filtración de listado de archivos en el bucket "vcards"
-- Supabase alerta que los buckets públicos no necesitan políticas SELECT para poder servir los archivos como URLs.
-- Tener el SELECT abierto permite listar (explorar) todos los archivos. Lo eliminamos para seguridad.
DROP POLICY IF EXISTS "Permitir ver archivos vcards público" ON storage.objects;
