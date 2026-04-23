import { getTenantBySlug, getUnitsByTenant } from '@/lib/dal';
import { notFound } from 'next/navigation';
import { 
  Zap, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Globe, 
  Download, 
  ChevronRight,
  CheckCircle2, 
  Car,
  ShieldCheck,
  Award,
  ArrowRight,
  Share2,
  Camera,
  Briefcase,
  Music
} from 'lucide-react';
import { 
  FacebookIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  TwitterIcon, 
  YoutubeIcon, 
  WhatsappIcon,
  TiktokIcon
} from '@/components/SocialIcons';
import Link from 'next/link';
import ScrollButton from '@/components/ScrollButton';

export const dynamic = 'force-dynamic';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '37, 99, 235';
  
  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);
  
  // Calculate luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  
  // If the color is too dark for a dark background (luminance < 100), lighten it
  if (luminance < 100) {
     const factor = 100 / Math.max(luminance, 1);
     r = Math.min(255, Math.round(r * factor));
     g = Math.min(255, Math.round(g * factor));
     b = Math.min(255, Math.round(b * factor));
     
     // Special case for pure black
     if (r === 0 && g === 0 && b === 0) {
       r = 120; g = 120; b = 120;
     }
  }
  
  return `${r}, ${g}, ${b}`;
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: tenant } = await getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }


  const { data: units } = await getUnitsByTenant(tenant.id);
  const brandColor = tenant.brand_color || '#2563eb';
  const brandRgb = hexToRgb(brandColor);

  // Convertir logo a Base64 para que aparezca SIEMPRE en el celular
  let logoBase64 = '';
  if (tenant.logo_url) {
    try {
      const res = await fetch(tenant.logo_url);
      const arrayBuffer = await res.arrayBuffer();
      logoBase64 = Buffer.from(arrayBuffer).toString('base64');
    } catch (err) {
      console.error('vCard logo fetch error:', err);
    }
  }

  let vcard: any = {};
  try {
    if (tenant.vcard_name && tenant.vcard_name.startsWith('{')) {
      vcard = JSON.parse(tenant.vcard_name);
    } else {
      vcard = { name: tenant.vcard_name || tenant.name };
    }
  } catch (e) {
    vcard = { name: tenant.vcard_name || tenant.name };
  }

  // Construcción de la vCard enriquecida (v3.0 / v4.0 support)
  const servicesList = vcard.services ? vcard.services.split('\n').filter(Boolean) : [];
  const servicesText = servicesList.join(', ');
  
  // Bloque de palabras clave masivo para búsqueda "invisible" en la agenda
  const searchableKeywords = [
    tenant.name,
    vcard.title,
    vcard.description,
    servicesText,
    'QR', 'ActivaQR', 'Digital Card', 'Contacto', 'Empresa', 'Negocio', 'Servicios',
    'Transporte', 'Logistica', 'Soporte', 'VCard', 'Ecuador', 'Loja'
  ].filter(Boolean).join(', ');

  // Repetimos palabras clave críticas para asegurar el indexado en Android/iOS
  const invisibleTags = Array(5).fill(searchableKeywords).join(' ');

  const vcardParts = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${vcard.name || tenant.name}`,
    `ORG:${tenant.name}`,
    `TITLE:${vcard.title || 'Servicios Corporativos'}`,
    `TEL;TYPE=WORK,VOICE:+${tenant.whatsapp_number || ''}`,
    `URL;TYPE=WORK:${vcard.website || ''}`,
    `ADR;TYPE=WORK:;;${vcard.address || ''};;;;`,
    `NOTE:🏢 EMPRESA: ${tenant.name}\\n📝 DESCRIPCIÓN: ${vcard.description || 'Especialistas en transporte y logística.'}\\n🛠 SERVICIOS: ${servicesText || 'Transporte Ejecutivo, Carga, Logística'}`,
    `CATEGORIES:${searchableKeywords}`,
  ];

  if (logoBase64) {
    vcardParts.push(`PHOTO;TYPE=PNG;ENCODING=b:${logoBase64}`);
  } else if (tenant.logo_url) {
    vcardParts.push(`PHOTO;VALUE=URI;TYPE=PNG:${tenant.logo_url}`);
  }

  // Redes Sociales con perfiles específicos
  if (vcard.facebook) {
    vcardParts.push(`URL;TYPE=facebook:${vcard.facebook}`);
    vcardParts.push(`X-SOCIALPROFILE;TYPE=facebook:${vcard.facebook}`);
  }
  if (vcard.instagram) {
    vcardParts.push(`URL;TYPE=instagram:${vcard.instagram}`);
    vcardParts.push(`X-SOCIALPROFILE;TYPE=instagram:${vcard.instagram}`);
  }
  if (vcard.linkedin) {
    vcardParts.push(`URL;TYPE=linkedin:${vcard.linkedin}`);
    vcardParts.push(`X-SOCIALPROFILE;TYPE=linkedin:${vcard.linkedin}`);
  }
  if (vcard.twitter) {
    vcardParts.push(`URL;TYPE=twitter:${vcard.twitter}`);
    vcardParts.push(`X-SOCIALPROFILE;TYPE=twitter:${vcard.twitter}`);
  }

  vcardParts.push('END:VCARD');
  const vcardUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardParts.join('\n'))}`;

  const socialLinks = [
    { id: 'facebook', icon: FacebookIcon, url: vcard.facebook },
    { id: 'instagram', icon: InstagramIcon, url: vcard.instagram },
    { id: 'linkedin', icon: LinkedinIcon, url: vcard.linkedin },
    { id: 'twitter', icon: TwitterIcon, url: vcard.twitter },
    { id: 'youtube', icon: YoutubeIcon, url: vcard.youtube },
    { id: 'whatsapp', icon: WhatsappIcon, url: vcard.whatsapp_url },
    { id: 'tiktok', icon: TiktokIcon, url: vcard.tiktok },
  ].filter(s => s.url && s.url.startsWith('http'));

  const darkBrandColor = `rgb(${Math.floor(parseInt(brandRgb.split(',')[0]) * 0.1)}, ${Math.floor(parseInt(brandRgb.split(',')[1]) * 0.1)}, ${Math.floor(parseInt(brandRgb.split(',')[2]) * 0.1)})`;

  // Mejores fallbacks para que no se vea repetitivo si el usuario no ha configurado nada
  const displayDescription = (vcard.description && vcard.description !== tenant.name) 
    ? vcard.description 
    : "Líderes en soluciones de transporte corporativo y logística integral. Nos enfocamos en la seguridad, puntualidad y excelencia en cada trayecto para garantizar la mejor experiencia a nuestros socios.";

  const displayServices = (servicesList.length > 0 && servicesList[0] !== tenant.name)
    ? servicesList
    : ["Transporte Ejecutivo VIP", "Logística Empresarial 24/7", "Monitoreo Satelital de Flota", "Mantenimiento Preventivo Certificado"];

  return (
    <div 
      className="min-h-screen text-white font-sans selection:bg-brand/30 selection:text-white overflow-x-hidden relative"
      style={{ backgroundColor: darkBrandColor, backgroundImage: `radial-gradient(circle at top, rgba(${brandRgb}, 0.2) 0%, ${darkBrandColor} 70%)` }}
    >
      {/* Ambient Brand Background Glows (Sobre fondo oscuro) */}
      <div className="absolute top-[10%] left-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none opacity-70 blur-[120px]" style={{ background: `radial-gradient(circle, rgba(${brandRgb}, 0.35) 0%, transparent 70%)` }}></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[70vw] h-[70vw] rounded-full pointer-events-none opacity-60 blur-[120px]" style={{ background: `radial-gradient(circle, rgba(${brandRgb}, 0.3) 0%, transparent 70%)` }}></div>
      
      
      <style>{`
        :root {
          --brand-primary: rgb(${brandRgb});
          --brand-rgb: ${brandRgb};
        }
        .bg-brand { background-color: ${brandColor}; }
        .text-brand { color: rgb(${brandRgb}); }
        .border-brand { border-color: rgba(${brandRgb}, 0.5); }
        .shadow-brand { box-shadow: 0 20px 50px -15px rgba(${brandRgb}, 0.5); }
        .glass-dark { background: rgba(${brandRgb}, 0.08); backdrop-filter: blur(16px); border: 1px solid rgba(${brandRgb}, 0.25); }
        .hero-mesh { background-image: radial-gradient(at 0% 0%, rgba(${brandRgb}, 0.3) 0, transparent 60%), radial-gradient(at 100% 0%, rgba(255, 255, 255, 0.05) 0, transparent 50%); }
        ${vcard.hero_desktop_url ? `
        .hero-bg {
          background-image: url('${vcard.hero_desktop_url}');
          background-size: cover;
          background-position: center;
        }
        @media (max-width: 768px) {
          .hero-bg {
            background-image: url('${vcard.hero_mobile_url || vcard.hero_desktop_url}');
          }
        }
        ` : ''}
      `}</style>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center pt-20 ${vcard.hero_desktop_url ? 'hero-bg' : 'hero-mesh'}`}>
        {vcard.hero_desktop_url && <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>}
        {!vcard.hero_desktop_url && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>}
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">

          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85] animate-in slide-in-from-bottom-12 duration-1000">
              {tenant.name}
            </h1>
            
            <div className="flex items-center justify-center gap-4 py-4 animate-in fade-in duration-1000 [animation-delay:400ms]">
               <div className="h-px w-8 bg-brand"></div>
               <p className="text-brand text-xs md:text-sm font-black uppercase tracking-[0.5em] italic">
                 {vcard.title || "Elite Mobility Intelligence"}
               </p>
               <div className="h-px w-8 bg-brand"></div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 animate-in slide-in-from-bottom-8 duration-700 [animation-delay:800ms]">
            <Link 
              href={`https://wa.me/${tenant.whatsapp_number}`}
              className="bg-brand text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-brand hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              Iniciar Chat Directo <MessageSquare className="w-4 h-4" />
            </Link>
            <Link 
              href={`/?tenantId=${tenant.id}`}
              className="glass-dark hover:bg-white/10 text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-4 group"
            >
              Reportar Incidente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Social Links Hero */}
          {socialLinks.length > 0 && (
            <div className="mt-16 flex gap-6 animate-in fade-in duration-1000 [animation-delay:1000ms]">
               {socialLinks.map(social => (
                 <Link key={social.id} href={social.url} target="_blank" className="w-12 h-12 rounded-full glass-dark flex items-center justify-center text-white/40 hover:text-brand hover:border-brand/40 transition-all hover:scale-110">
                    <social.icon className="w-5 h-5" />
                 </Link>
               ))}
            </div>
          )}
        </div>

        <ScrollButton />
      </section>

      {/* Main Content Grid */}
      <section id="content" className="py-24 md:py-32 container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Side: Story & Values */}
          <div className="space-y-12">
            <div className="space-y-6">
               <div className="flex items-center gap-6 mb-8">
                 <div className="w-24 h-24 shrink-0">
                    {tenant.logo_url ? (
                      <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain drop-shadow-2xl" />
                    ) : (
                      <Zap className="w-full h-full text-brand fill-current drop-shadow-2xl" />
                    )}
                 </div>
                 <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-dark border-brand/20 h-fit">
                   <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-brand">Nuestra Historia</span>
                 </div>
               </div>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                 Liderazgo que <br /> <span className="text-white/30 italic">define el mañana.</span>
               </h2>
               <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-white/50 leading-relaxed font-medium text-base md:text-lg">
                    {displayDescription}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="vision-window p-8 glass-dark group hover:bg-brand/5 transition-colors">
                  <p className="text-5xl font-black text-white mb-2 group-hover:text-brand transition-colors">{units?.length || 0}</p>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Flota Inteligente</p>
               </div>
               <div className="vision-window p-8 glass-dark group hover:bg-brand/5 transition-colors">
                  <p className="text-5xl font-black text-white mb-2 group-hover:text-brand transition-colors">100%</p>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Control Digital</p>
               </div>
            </div>
          </div>

          {/* Right Side: Services Showcase */}
          <div className="vision-window p-10 glass-dark border border-brand/20 space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] pointer-events-none"></div>
             
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-brand">
                   <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Portafolio de Servicios</h3>
                   <p className="text-[9px] font-black text-brand uppercase tracking-widest mt-1">Soluciones a Medida</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-3 md:gap-4 overflow-y-auto max-h-[350px] md:max-h-[400px] pr-2 custom-scrollbar">
                {displayServices.map((service: string, i: number) => (
                   <div key={i} className="group flex items-center justify-between p-4 rounded-2xl glass-dark hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-brand group-hover:scale-150 transition-all"></div>
                         <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-white/80">{service.replace('• ', '')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-brand transition-colors" />
                   </div>
                ))}
             </div>
          </div>

        </div>
      </section>

      {/* Fleet Stats (The Grid) */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
             <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-brand">Directorio de Unidades</span>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">Estado de la Flota</h2>
             </div>
             <p className="text-white/40 text-sm font-bold uppercase tracking-widest italic max-w-sm text-right">
                Todas nuestras unidades operan bajo estrictos estándares de mantenimiento preventivo.
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {units?.map((unit: any) => {
              return (
                <div key={unit.id} className="vision-window p-8 glass-dark hover:border-brand/50 hover:shadow-brand transition-all group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-brand group-hover:text-white transition-all shadow-xl">
                      <Car className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-dark border-emerald-500/20">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <h4 className="text-4xl font-black italic tracking-tighter text-white mb-1 group-hover:text-brand transition-colors">{unit.unit_code}</h4>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{unit.unit_number || 'Standard Unit'}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Thin Professional Footer */}
      <footer className="relative pt-10 pb-10 border-t border-white/5 bg-black/20">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-20 items-center">
               <div className="md:col-span-5 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl glass-dark p-2">
                        {tenant.logo_url ? <img src={tenant.logo_url} className="w-full h-full object-contain" /> : <Zap className="w-full h-full text-brand" />}
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tighter">{tenant.name}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-brand" /> {vcard.address || 'Ecuador'}
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <Phone className="w-3 h-3 text-brand" /> +{tenant.whatsapp_number}
                    </div>
                  </div>

                  <div className="flex gap-3">
                     {socialLinks.map(social => (
                       <Link key={social.id} href={social.url} target="_blank" className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center text-white/40 hover:text-brand transition-all border border-white/5">
                          <social.icon className="w-4 h-4" />
                       </Link>
                     ))}
                  </div>
               </div>

               <div className="md:col-span-7 flex flex-col md:flex-row gap-6 md:items-center md:justify-end">
                  <a 
                    href={vcardUrl} 
                    download={`${tenant.name.replace(/\s+/g, '_')}_Contacto.vcf`}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand hover:text-white transition-all shadow-xl"
                  >
                    Descargar VCF <Download className="w-4 h-4" />
                  </a>
                  
                  <div className="md:border-l md:border-white/10 md:pl-6 space-y-2 text-center md:text-right">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">© {new Date().getFullYear()} {tenant.name}.</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Hecho por <a href="https://www.activaqr.com" target="_blank" className="text-brand hover:underline">www.activaqr.com</a></p>
                  </div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
