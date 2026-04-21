const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testFlow() {
  const unitId = '78b74a70-ac4c-4918-43d9-0c3e491843d9';
  const ticket = 'TKT-TEST-WPP';

  // 1. Crear reporte de prueba
  console.log('📝 Creando reporte de prueba...');
  const { data: report, error: repErr } = await supabase
    .from('activaqr2_reports')
    .insert([{
      unit_id: unitId,
      ticket_number: ticket,
      description: 'Prueba de integración WhatsApp Evolution API',
      type: 'queja',
      status: 'Nuevo'
    }])
    .select()
    .single();

  if (repErr) {
    console.error('❌ Error creando reporte:', repErr.message);
    return;
  }

  console.log('✅ Reporte creado ID:', report.id);
  console.log('🔔 Por favor, revisa el Dashboard o espera a que llame a la acción de notificación...');
}

testFlow();
