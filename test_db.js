require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.from('activaqr2_units').select('id, tenant_id').limit(1);
  if (data && data.length > 0) {
    console.log(`URL válida: https://activaqr2.vercel.app/?tenantId=${data[0].tenant_id}&unitId=${data[0].id}`);
  } else {
    console.log("No hay unidades en la DB");
  }
}
check();
