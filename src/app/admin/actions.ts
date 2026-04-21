'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendWelcomeEmail } from '@/lib/email';

export async function createTenant(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const plan = formData.get('plan') as string;
  const price = parseFloat(formData.get('price') as string || '0');
  const whatsapp = formData.get('whatsapp') as string;

  // 0. Validar si el email ya está en uso en el mapeo de usuarios
  const { data: existingUser } = await supabase
    .from('activaqr2_users')
    .select('id, email, tenant_id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error(`El email ${email} ya está registrado y vinculado a otra empresa.`);
  }

  // Determinar max_units según el plan
  let maxUnits = 1;
  if (plan === 'empresa_10') maxUnits = 10;
  if (plan === 'empresa_50') maxUnits = 50;

  // 1. Crear el Tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('activaqr2_tenants')
    .insert({
      name,
      linked_email: email,
      whatsapp_number: whatsapp,
      plan,
      max_units: maxUnits,
      monthly_price: price,
      subscription_status: 'active',
      subscription_start: new Date().toISOString(),
    })
    .select()
    .single();

  if (tenantError) {
    console.error('Error creating tenant:', tenantError);
    throw new Error('Error al crear la empresa en la base de datos.');
  }

  // 2. Crear o Actualizar el Usuario Admin en Auth
  if (email && tenant) {
    let authUserId: string | null = null;

    // Intentar crear en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      // Si el usuario ya existe, intentamos obtener su ID para actualizarlo
      if (authError.message.includes('already registered')) {
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        const foundUser = listData?.users.find((u: any) => u.email === email);
        
        if (foundUser) {
          authUserId = foundUser.id;
          // Actualizamos la contraseña del usuario existente
          await supabase.auth.admin.updateUserById(authUserId, { password });
        } else {
          throw new Error('Error al recuperar el usuario existente en Auth.');
        }
      } else {
        console.error('Error creating user in Supabase Auth:', authError);
        throw new Error(`Error de autenticación: ${authError.message}`);
      }
    } else {
      authUserId = authData.user.id;
    }

    // 3. UPSERT en activaqr2_users (vínculo seguro)
    const { error: userError } = await supabase
      .from('activaqr2_users')
      .upsert({
        email,
        tenant_id: tenant.id,
        role: 'tenant_admin'
      }, { onConflict: 'email' });
      
    if (userError) {
      console.error('Error mapping user to tenant:', userError);
      // No frenamos, pero es crítico registrarlo
    }

    // 4. Enviar email de bienvenida (siempre se intenta si llegamos aquí)
    try {
      await sendWelcomeEmail(email, name, password);
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr);
      // No fallamos el registro por el email, pero avisamos en consola
    }
  }

  revalidatePath('/admin');
  redirect('/admin');
}

export async function updateTenant(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const plan = formData.get('plan') as string;
  const price = parseFloat(formData.get('price') as string || '0');
  const whatsapp = formData.get('whatsapp') as string;
  const subscription_status = formData.get('subscription_status') as string;

  let maxUnits = 1;
  if (plan === 'empresa_10') maxUnits = 10;
  if (plan === 'empresa_50') maxUnits = 50;
  if (plan === 'solo') maxUnits = 1;

  const { error: tenantError } = await supabase
    .from('activaqr2_tenants')
    .update({
      name,
      whatsapp_number: whatsapp,
      plan,
      max_units: maxUnits,
      monthly_price: price,
      subscription_status,
    })
    .eq('id', id);

  if (tenantError) {
    console.error('Error updating tenant:', tenantError);
    throw new Error('Error al actualizar la empresa.');
  }

  revalidatePath('/admin');
}
