const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetUser() {
  const email = 'reyescesarenloja@gmail.com';
  const newPassword = 'admin12345';

  console.log(`🔍 Buscando usuario: ${email}...`);
  
  // Listar usuarios para encontrar el ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listando usuarios:', listError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.log(`⚠️ El usuario ${email} no existe en Supabase Auth. Intentando crear...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: newPassword,
      email_confirm: true
    });

    if (createError) {
      console.error('❌ Error creando usuario:', createError.message);
    } else {
      console.log(`✅ Usuario creado con éxito. Password: ${newPassword}`);
    }
  } else {
    console.log(`🔄 Usuario encontrado (ID: ${user.id}). Reseteando password...`);
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error reseteando password:', updateError.message);
    } else {
      console.log(`✅ Password reseteado con éxito. Nuevo password: ${newPassword}`);
    }
  }
}

resetUser();
