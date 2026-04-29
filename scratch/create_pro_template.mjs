import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restoreProTemplate() {
  const slug = 'nexus-logistics';
  const email = 'ceo@nexus-logistics.com';
  
  console.log(`Restaurando a: ${slug}...`);

  const { data: existing } = await supabaseAdmin
    .from('activaqr2_tenants')
    .select('id')
    .eq('linked_email', email)
    .maybeSingle();

  const vcard_name = JSON.stringify({
    name: "Nexus Global Logistics",
    title: "Logística y Seguridad de Clase Mundial",
    website: "https://nexus-logistics.com",
    address: "Av. de los Granados y 10 de Agosto, Quito - Ecuador",
    slug: slug,
    description: "Con más de 15 años de experiencia, somos el socio estratégico líder en transporte pesado y logística integral en todo el territorio ecuatoriano. Seguridad, puntualidad y tecnología en cada kilómetro.",
    services: [
      "Transporte de Carga Pesada",
      "Logística de Distribución Nacional",
      "Monitoreo Satelital 24/7",
      "Gestión de Inventarios Pro"
    ],
    hero_desktop_url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=2000",
    hero_mobile_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000",
    video_url: "https://www.youtube.com/embed/WfGRXvIRxMY",
    about_image_url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1000",
    google_maps_url: "https://goo.gl/maps/xyz"
  });

  const tenantData = {
    name: "Nexus Global Logistics",
    linked_email: email,
    brand_color: "#001e3c",
    logo_url: "https://www.activaqr.com/_next/image?url=%2Fimages%2Flogo_header.png&w=256&q=75",
    vcard_name: vcard_name,
    subscription_status: 'active'
  };

  if (existing) {
    await supabaseAdmin.from('activaqr2_tenants').update(tenantData).eq('id', existing.id);
  } else {
    await supabaseAdmin.from('activaqr2_tenants').insert(tenantData);
  }

  console.log('✅ ¡Nexus Global Logistics restaurado!');
}

restoreProTemplate();
