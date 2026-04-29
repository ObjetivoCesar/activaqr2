import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateProStats() {
  const email = 'ceo@transportes-elite.ec';
  
  const { data: existing } = await supabaseAdmin
    .from('activaqr2_tenants')
    .select('id, vcard_name')
    .eq('linked_email', email)
    .maybeSingle();

  if (existing) {
    let vcard = JSON.parse(existing.vcard_name);
    // Añadimos unidades ficticias para que el contador no sea 0
    // (O simplemente actualizamos el componente para manejar un valor base)
    // Pero mejor creamos unidades reales en la tabla para que sea dinámico.
    
    console.log('Creando unidades reales para el contador...');
    const unitsToCreate = Array.from({ length: 52 }, (_, i) => ({
      tenant_id: existing.id,
      name: `Unidad Elite ${i + 1}`,
      plate_number: `T-ELITE-${i + 100}`,
      unit_code: `${i + 101}`,
      status: 'active'
    }));

    // Borramos demos anteriores
    await supabaseAdmin.from('activaqr2_units').delete().eq('tenant_id', existing.id);
    
    // Insertamos la nueva flota de 52 unidades
    await supabaseAdmin.from('activaqr2_units').insert(unitsToCreate);

    console.log('✅ Flota de 52 unidades creada para Transportes Elite.');
  }
}

updateProStats();
