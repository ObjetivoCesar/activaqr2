const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Note: Using environment variables or hardcoded values for the seed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding demo data...');

  // 1. Get Tenant ID
  const { data: tenant } = await supabase
    .from('activaqr2_tenants')
    .select('id')
    .eq('slug', 'sur-oriente-tours')
    .single();

  if (!tenant) {
    console.error('❌ Tenant not found. Run migrations first.');
    return;
  }

  // 2. Get Units
  const { data: units } = await supabase
    .from('activaqr2_units')
    .select('id, unit_code')
    .eq('tenant_id', tenant.id);

  if (!units || units.length === 0) {
    console.error('❌ No units found for tenant.');
    return;
  }

  const reports = [
    {
      type: 'felicitacion',
      description: 'Excelente servicio del chofer Jorge. Muy puntual y el aire acondicionado funcionaba perfecto.',
      rating: 5,
      status: 'Resuelto',
      is_urgent: false
    },
    {
      type: 'queja',
      description: 'El conductor iba con exceso de velocidad en la zona urbana de San Cristóbal.',
      rating: 1,
      status: 'Nuevo',
      is_urgent: true,
      location_lat: 7.767,
      location_lng: -72.224
    },
    {
      type: 'sugerencia',
      description: 'Sería genial si pudieran aceptar pagos vía Zelle o Pago Móvil directamente en la unidad.',
      rating: 4,
      status: 'En Proceso',
      is_urgent: false
    },
    {
      type: 'queja',
      description: 'La unidad BUS-010 tiene un asiento roto en la parte de atrás.',
      rating: 2,
      status: 'Nuevo',
      is_urgent: true
    },
    {
      type: 'felicitacion',
      description: 'Muy limpio el vehículo. Se nota el mantenimiento.',
      rating: 5,
      status: 'Nuevo',
      is_urgent: false
    }
  ];

  for (let i = 0; i < reports.length; i++) {
    const rep = reports[i];
    const unit = units[i % units.length];
    const ticketNumber = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;

    const { error } = await supabase.from('activaqr2_reports').insert({
      tenant_id: tenant.id,
      unit_id: unit.id,
      source: 'web',
      type: rep.type,
      description: rep.description,
      rating: rep.rating,
      status: rep.status,
      is_urgent: rep.is_urgent,
      ticket_number: ticketNumber,
      location_lat: rep.location_lat || null,
      location_lng: rep.location_lng || null,
      created_at: new Date(Date.now() - (i * 3600000 * 2)).toISOString() // Variado en el tiempo
    });

    if (error) console.error(`❌ Error inserting report ${i}:`, error);
    else console.log(`✅ Inserted report ${ticketNumber}`);
  }

  console.log('✨ Seeding complete!');
}

seed();
