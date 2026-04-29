const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('activaqr2_tenants').select('*');
  const t = data.find(x => x.vcard_name && x.vcard_name.includes('transportes-abelito'));
  if (t) {
    console.log(t.name);
    console.log(JSON.parse(t.vcard_name));
  }
}
check();
