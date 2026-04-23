'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Actualiza la configuración de marca blanca de un tenant.
 * Usa el cliente de Supabase con Service Role para asegurar que los cambios se guarden.
 */
export async function updateTenantAction(id: string, data: any) {
  console.log('🔄 [SERVER ACTION] Iniciando actualización de tenant:', id);
  
  if (!id) {
    console.error('❌ ID de tenant no proporcionado');
    return { success: false, error: 'ID de tenant no proporcionado' };
  }

  if (!supabase) {
    console.error('❌ Error Crítico: El cliente de Supabase (Service Role) no está inicializado. Verifique SUPABASE_SERVICE_ROLE_KEY.');
    return { success: false, error: 'Error de configuración en el servidor (Clave de base de datos faltante)' };
  }

  try {
    const { error, data: updatedData } = await supabase
      .from('activaqr2_tenants')
      .update(data)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error de Supabase al actualizar tenant:', error);
      return { success: false, error: error.message };
    }

    if (!updatedData || updatedData.length === 0) {
      console.warn('⚠️ No se encontró el registro para actualizar o no hubo cambios:', id);
      return { success: false, error: 'No se encontró la empresa o no tienes permisos para editarla.' };
    }

    console.log('✅ Tenant actualizado correctamente en DB:', updatedData[0].name);
    
    // Revalidar de forma agresiva para limpiar cualquier caché
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (err: any) {
    console.error('💥 Error crítico en updateTenantAction:', err);
    return { success: false, error: err.message || 'Error desconocido en el servidor' };
  }
}
