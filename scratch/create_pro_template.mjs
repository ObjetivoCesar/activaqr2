import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createProTemplate() {
  const slug = 'nexus-logistics';
  console.log(`Creando plantilla Pro para: ${slug}...`);

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

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('activaqr2_tenants')
    .upsert({
      name: "Nexus Global Logistics",
      linked_email: "ceo@nexus-logistics.com",
      brand_color: "#001549",
      logo_url: "https://www.activaqr.com/_next/image?url=%2Fimages%2Flogo_header.png&w=256&q=75",
      vcard_name: vcard_name,
      subscription_status: 'active'
    }, { onConflict: 'linked_email' })
    .select()
    .single();

  if (tenantError) {
    console.error('Error creando tenant:', tenantError);
  } else {
    console.log('✅ ¡Nexus Logistics Creado!');
    console.log(`URL de prueba: http://localhost:3006/p/${slug}`);
  }
}

createProTemplate();
