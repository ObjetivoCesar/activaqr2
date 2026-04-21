
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

async function resetPassword() {
  const email = 'cristhopheryeah113@gmail.com';
  const newPassword = 'Olakasetk1';
  const userId = 'ee1737a3-b71a-4a6a-99b8-b33463115ec5';

  console.log(`Resetting password for: ${email}`);

  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    console.error('Error resetting password:', error.message);
  } else {
    console.log('Password successfully reset to: Olakasetk1');
  }
}

resetPassword();
