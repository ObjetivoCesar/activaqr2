'use server';

import { supabase } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function setTenantAccess(tenantId: string, formData: FormData) {
  const password = formData.get('password') as string;

  // 1. Obtener datos del tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('activaqr2_tenants')
    .select('name, linked_email')
    .eq('id', tenantId)
    .single();

  if (tenantError || !tenant) {
    throw new Error('Empresa no encontrada.');
  }

  const email = tenant.linked_email;
  if (!email) {
    throw new Error('Esta empresa no tiene un email vinculado.');
  }

  // 2. Gestionar en Supabase Auth
  let authUserId: string | null = null;

  // Buscar si el usuario ya existe para evitar el error de "ya registrado"
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingUser = listData?.users.find((u: any) => u.email === email);

  if (existingUser) {
    // Caso: El usuario ya existe, solo actualizamos su contraseña
    authUserId = existingUser.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, { 
      password,
      email_confirm: true 
    });
    
    if (updateError) {
      throw new Error(`Error al actualizar contraseña: ${updateError.message}`);
    }
  } else {
    // Caso: Usuario nuevo, lo creamos
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Error al crear acceso: ${authError.message}`);
    }
    authUserId = authData.user.id;
  }

  // 3. Mapping en activaqr2_users (Upsert)
  const { error: userError } = await supabase
    .from('activaqr2_users')
    .upsert({
      email,
      tenant_id: tenantId,
      role: 'tenant_admin'
    }, { onConflict: 'email' });

  if (userError) {
    console.error('Error mapping user:', userError);
    throw new Error('Error al vincular el usuario con la empresa.');
  }

  // 4. Enviar email
  try {
    await sendWelcomeEmail(email, tenant.name, password);
  } catch (err) {
    console.error('Email error:', err);
  }

  revalidatePath('/admin');
  redirect('/admin');
}
