import { getTenantBySlug, getUnitsByTenant } from '@/lib/dal';
import { notFound } from 'next/navigation';
import LandingClient from './LandingClient';

export const dynamic = 'force-dynamic';

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : '37, 99, 235';
}

function getContrastColor(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return '#ffffff';
  const lum = 0.299 * parseInt(r[1],16) + 0.587 * parseInt(r[2],16) + 0.114 * parseInt(r[3],16);
  return lum > 140 ? '#000000' : '#ffffff';
}

function getEnhancedCopy(name: string, rawDescription: string) {
  const isFiller = rawDescription.length < 50 || rawDescription.includes(name + " " + name);
  
  if (isFiller) {
    return {
      heroSubtitle: "Soluciones Logísticas de Clase Mundial",
      heroTitle: `Impulsando el futuro de ${name}`,
      heroText: `En ${name}, transformamos el transporte en una experiencia de seguridad y eficiencia. Con una flota moderna y tecnología de vanguardia, conectamos destinos y superamos expectativas en cada kilómetro.`,
      aboutTitle: "Compromiso con la excelencia operativa",
      aboutText: `Fundada bajo principios de integridad y puntualidad, ${name} se ha consolidado como el aliado estratégico para quienes buscan un transporte sin complicaciones. Nuestra infraestructura está diseñada para garantizar que cada unidad sea un sinónimo de confianza.`,
      mission: "Garantizar la movilidad más segura y eficiente del sector.",
      vision: "Ser la cooperativa líder reconocida por su innovación y calidad humana."
    };
  }

  return {
    heroSubtitle: "Transporte y Logística Profesional",
    heroTitle: name,
    heroText: rawDescription.substring(0, 180) + "...",
    aboutTitle: `Conozca más sobre ${name}`,
    aboutText: rawDescription,
    mission: "Seguridad y puntualidad en cada servicio prestado.",
    vision: "Liderazgo regional en soluciones de movilidad integral."
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: tenant } = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const { data: units } = await getUnitsByTenant(tenant.id);
  const brand = tenant.brand_color || '#11791e';
  const brandRgb = hexToRgb(brand);
  const brandContrast = getContrastColor(brand);

  let vcard: any = {};
  try {
    vcard = tenant.vcard_name?.startsWith('{') ? JSON.parse(tenant.vcard_name) : { name: tenant.vcard_name || tenant.name };
  } catch { vcard = { name: tenant.name }; }

  const copy = getEnhancedCopy(tenant.name, vcard.description || "");

  const services = Array.isArray(vcard.services) 
    ? vcard.services 
    : (vcard.services ? vcard.services.split('\n').filter((s: string) => s.trim().length > 3) : [
        'Transporte Ejecutivo VIP', 'Logística Empresarial 24/7',
        'Monitoreo Satelital Real-Time', 'Mantenimiento Preventivo Certificado'
      ]);

  // ENVIAMOS SOLO DATOS PUROS (No iconos)
  const socialLinks = [
    { id: 'instagram', url: vcard.instagram, label: 'Instagram' },
    { id: 'whatsapp', url: vcard.whatsapp_url || `https://wa.me/${tenant.whatsapp_number}`, label: 'WhatsApp' },
    { id: 'facebook', url: vcard.facebook, label: 'Facebook' },
    { id: 'tiktok', url: vcard.tiktok, label: 'TikTok' },
  ].filter(s => s.url?.startsWith('http'));

  const vcardData = [
    'BEGIN:VCARD','VERSION:3.0',
    `FN:${vcard.name || tenant.name}`,`ORG:${tenant.name}`,
    `TITLE:${vcard.title || 'Servicios de Transporte'}`,
    `TEL;TYPE=WORK,VOICE:+${tenant.whatsapp_number || ''}`,
    `ADR;TYPE=WORK:;;${vcard.address || ''};;;;`,
    'END:VCARD'
  ].join('\n');
  const vcardUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardData)}`;

  return (
    <LandingClient 
      tenant={tenant}
      units={units || []}
      copy={copy}
      brand={brand}
      brandRgb={brandRgb}
      brandContrast={brandContrast}
      vcard={vcard}
      services={services}
      socialLinks={socialLinks}
      vcardUrl={vcardUrl}
    />
  );
}
