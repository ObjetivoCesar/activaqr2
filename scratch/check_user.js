
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const email = 'cristhopheryeah113@gmail.com';
  console.log(`Checking user: ${email}`);

  // 1. Check in Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing users:', authError.message);
    return;
  }

  const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (authUser) {
    console.log('User found in Supabase Auth:');
    console.log(`- ID: ${authUser.id}`);
    console.log(`- Email: ${authUser.email}`);
    console.log(`- Last Sign In: ${authUser.last_sign_in_at}`);
    console.log(`- Confirmed At: ${authUser.email_confirmed_at}`);
  } else {
    console.log('User NOT found in Supabase Auth.');
  }

  // 2. Check in activaqr2_users
  const { data: userData, error: dbError } = await supabase
    .from('activaqr2_users')
    .select('*')
    .eq('email', email)
    .single();

  if (dbError) {
    console.error('Error in activaqr2_users table:', dbError.message);
  } else if (userData) {
    console.log('User found in activaqr2_users table:');
    console.log(`- Role: ${userData.role}`);
    console.log(`- Tenant ID: ${userData.tenant_id}`);
  } else {
    console.log('User NOT found in activaqr2_users table.');
  }
}

checkUser();
