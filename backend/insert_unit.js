const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente para evitar dependencia de dotenv en scripts rápidos
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const tenantId = '234d5dbd-ad12-4baf-a421-87dd542825c1';
const newUnit = {
  id: '78b74a70-ac4c-4918-43d9-0c3e491843d9', // Generado aleatorio para prueba
  tenant_id: tenantId,
  unit_code: '102',
  plate: 'AAC-1234',
  created_at: new Date().toISOString()
};

async function addUnit() {
  console.log('🚀 Insertando nueva unidad...');
  const { data, error } = await supabase
    .from('activaqr2_units')
    .insert([newUnit])
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Unidad creada con éxito:');
    console.log(`🔗 Link de Simulador: https://activaqr2.vercel.app/?tenantId=${tenantId}&unitId=${newUnit.id}`);
  }
}

addUnit();
