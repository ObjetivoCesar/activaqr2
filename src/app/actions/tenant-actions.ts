'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Actualiza la configuración de marca blanca de un tenant.
 * Usa el cliente de Supabase con Service Role para asegurar que los cambios se guarden.
 */
export async function updateTenantAction(id: string, data: any) {
  console.log('🔄 Iniciando actualización de tenant:', id);
  console.log('📦 Datos a guardar:', JSON.stringify(data, null, 2));

  if (!id) {
    return { success: false, error: 'ID de tenant no proporcionado' };
  }

  try {
    const { error, data: updatedData } = await supabase
      .from('activaqr2_tenants')
      .update(data)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error en Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Tenant actualizado correctamente:', updatedData);
    
    // Revalidar la ruta del dashboard para que los cambios se reflejen
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (err: any) {
    console.error('💥 Error crítico en updateTenantAction:', err);
    return { success: false, error: err.message || 'Error desconocido en el servidor' };
  }
}
