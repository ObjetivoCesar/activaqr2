import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function resetPassword() {
  const email = 'automatizotunegocio@gmail.com';
  const newPassword = 'ActivaQR2026!';

  console.log(`Intentando resetear contraseña para: ${email}...`);

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listando usuarios:', listError);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error('Usuario no encontrado.');
    return;
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error('Error al actualizar contraseña:', error);
  } else {
    console.log('✅ ¡Contraseña actualizada con éxito!');
    console.log(`Usuario: ${email}`);
    console.log(`Nueva Contraseña: ${newPassword}`);
  }
}

resetPassword();
