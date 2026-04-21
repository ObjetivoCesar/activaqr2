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

  // Intentar crear
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      // Obtener ID para actualizar
      const { data: listData } = await supabase.auth.admin.listUsers();
      const foundUser = listData?.users.find((u: any) => u.email === email);
      
      if (foundUser) {
        authUserId = foundUser.id;
        await supabase.auth.admin.updateUserById(authUserId, { password });
      } else {
        throw new Error('No se pudo recuperar el ID del usuario en Auth.');
      }
    } else {
      throw new Error(`Error en Auth: ${authError.message}`);
    }
  } else {
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
