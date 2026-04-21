'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { getSessionTenantId } from '@/lib/dal';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createUnit(data: any) {
  const { unit_code, plate, owner_name, driver_name, driver_id, notification_number } = data;
  
  // 1. Obtener Tenant de la sesión (Seguridad)
  let tenantId;
  try {
    tenantId = await getSessionTenantId();
  } catch (e) {
    return { success: false, error: 'No autorizado' };
  }

  // 2. Verificar límites del Plan
  const { data: tenant, error: tenantQueryError } = await supabase
    .from('activaqr2_tenants')
    .select('id, name, linked_email, logo_url, max_units')
    .eq('id', tenantId)
    .single();

  if (tenantQueryError || !tenant) {
    return { success: false, error: 'Error al verificar el plan' };
  }

  const { count: currentUnits } = await supabase
    .from('activaqr2_units')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if ((currentUnits || 0) >= (tenant.max_units || 0)) {
    return { 
      success: false, 
      error: `Límite de unidades alcanzado (${tenant.max_units}). Contacta a soporte para ampliar tu plan.` 
    };
  }

  // 3. Insertar la unidad
  const { error } = await supabase
    .from('activaqr2_units')
    .insert({
      tenant_id: tenantId,
      unit_code,
      plate,
      owner_name,
      driver_name,
      driver_id,
      notification_number,
      status: 'Activo'
    });

  if (error) {
    console.error('Error creating unit:', error);
    return { success: false, error };
  }

  try {
    if (tenant.linked_email) {
      await resend.emails.send({
        from: `ActivaQR <${process.env.RESEND_FROM_EMAIL || 'notificaciones@activaqr.com'}>`,
        to: tenant.linked_email,
        subject: `🚗 Nueva Unidad Registrada: ${unit_code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              ${tenant.logo_url ? `<img src="${tenant.logo_url}" alt="${tenant.name}" style="max-height: 50px; margin-bottom: 10px;">` : ''}
              <h1 style="color: #111; margin: 0;">¡Unidad Registrada!</h1>
            </div>
            <p>Hola <strong>${tenant.name}</strong>,</p>
            <p>Se ha registrado exitosamente una nueva unidad en el sistema ActivaQR2:</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Código:</strong> ${unit_code}</p>
              <p style="margin: 5px 0;"><strong>Placa:</strong> ${plate || 'No especificada'}</p>
              <p style="margin: 5px 0;"><strong>Chofer:</strong> ${driver_name || 'No asignado'}</p>
              <p style="margin: 5px 0;"><strong>ID Chofer:</strong> ${driver_id || 'N/A'}</p>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
              Este es un correo automático de control interno para ActivaQR2.
            </p>
          </div>
        `
      });
    }
  } catch (emailError) {
    console.error('Error enviando email de confirmación:', emailError);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateUnit(id: string, data: any) {
  const { error } = await supabase
    .from('activaqr2_units')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating unit:', error);
    return { success: false, error };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteUnit(id: string) {
  const { error } = await supabase
    .from('activaqr2_units')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting unit:', error);
    return { success: false, error };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
