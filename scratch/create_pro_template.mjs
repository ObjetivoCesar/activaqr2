import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createProTemplate() {
  const slug = 'nexus-logistics';
  const email = 'ceo@nexus-logistics.com';
  
  console.log(`Verificando existencia de: ${slug}...`);

  // 1. Buscar si ya existe
  const { data: existing } = await supabaseAdmin
    .from('activaqr2_tenants')
    .select('id')
    .eq('linked_email', email)
    .maybeSingle();

  const vcard_name = JSON.stringify({
    name: "Nexus Global Logistics",
    title: "Soporte Premium 24/7",
    website: "https://nexus-logistics.com",
    address: "World Trade Center, Torre A, Quito",
    slug: slug,
    description: "Líderes en transporte corporativo y logística inteligente. Nuestra flota cuenta con tecnología de punta y monitoreo satelital constante para garantizar su seguridad y puntualidad.",
    services: [
      "Transporte Ejecutivo VIP",
      "Logística de Carga Crítica",
      "Monitoreo IA en Tiempo Real",
      "Seguro de Pasajero Premium"
    ],
    hero_desktop_url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=2000",
    hero_mobile_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    about_image_url: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1000",
    google_maps_url: "https://goo.gl/maps/xyz"
  });

  const tenantData = {
    name: "Nexus Global Logistics",
    linked_email: email,
    brand_color: "#001549",
    logo_url: "https://www.activaqr.com/_next/image?url=%2Fimages%2Flogo_header.png&w=256&q=75",
    vcard_name: vcard_name,
    subscription_status: 'active'
  };

  if (existing) {
    console.log('Actualizando tenant existente...');
    await supabaseAdmin.from('activaqr2_tenants').update(tenantData).eq('id', existing.id);
  } else {
    console.log('Insertando nuevo tenant...');
    await supabaseAdmin.from('activaqr2_tenants').insert(tenantData);
  }

  console.log('✅ ¡Nexus Logistics sincronizado en la Base de Datos!');
}

createProTemplate();
