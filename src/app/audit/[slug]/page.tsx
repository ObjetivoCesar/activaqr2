import { getTenantBySlug, getUnitsByTenant } from '@/lib/dal';
import { notFound } from 'next/navigation';
import { 
  MessageSquare, Phone, MapPin, Download, Star, ChevronRight, 
  Car, Shield, Clock, Globe, Zap, Award, CheckCircle2, 
  Users, Mail, Play, ExternalLink
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsappIcon, TiktokIcon } from '@/components/SocialIcons';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// --- HELPERS ---
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

function getEmbedUrl(url: string) {
  if (!url) return '';
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return url;
}

// --- INTELLIGENT COPYWRITING ENGINE ---
// Este motor genera textos profesionales si el usuario pone texto de relleno
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

  const socials = [
    { id: 'instagram', icon: InstagramIcon, url: vcard.instagram, label: 'Instagram' },
    { id: 'whatsapp', icon: WhatsappIcon, url: vcard.whatsapp_url || `https://wa.me/${tenant.whatsapp_number}`, label: 'WhatsApp' },
    { id: 'facebook', icon: FacebookIcon, url: vcard.facebook, label: 'Facebook' },
    { id: 'tiktok', icon: TiktokIcon, url: vcard.tiktok, label: 'TikTok' },
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

  const heroDesktop = vcard.hero_desktop_url || 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop';
  const heroMobile = vcard.hero_mobile_url || heroDesktop;
  const aboutImg = vcard.about_image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .brand-bg { background-color: ${brand}; color: ${brandContrast}; }
        .brand-text { color: ${brand}; }
        .brand-border { border-color: ${brand}; }
        .brand-btn { 
          background-color: ${brand}; 
          color: ${brandContrast};
          transition: all 0.3s ease;
        }
        .brand-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(${brandRgb}, 0.2); }
        .brand-outline {
          border: 2px solid ${brand};
          color: ${brand};
          transition: all 0.3s ease;
        }
        .brand-outline:hover { background-color: ${brand}; color: ${brandContrast}; }
        .section-dark { background-color: #0f172a; color: white; }
        .glass-header { 
          background: rgba(15, 23, 42, 0.8); 
          backdrop-filter: blur(12px); 
          border-bottom: 3px solid ${brand};
        }
        .hero-gradient {
          background: linear-gradient(to right, #0f172a 40%, rgba(15, 23, 42, 0.4) 100%);
        }
        .social-circle {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
          color: rgba(255,255,255,0.6);
        }
        .social-circle:hover { border-color: ${brand}; color: ${brand}; transform: translateY(-3px); }
        .feature-card {
          padding: 40px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
        }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); border-color: ${brand}33; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="glass-header fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 md:h-12 w-auto object-contain" />
          ) : (
            <span className="text-xl font-black text-white uppercase tracking-tighter">
              {tenant.name} <span className="brand-text">.</span>
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#servicios" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Servicios</Link>
          <Link href="#video" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Corporativo</Link>
          <Link href="#unidades" className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Flota</Link>
        </div>
        <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="brand-btn px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
          Soporte 24/7
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 hero-bg bg-cover bg-center transition-all duration-1000" />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full brand-bg animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{copy.heroSubtitle}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter uppercase">
              {copy.heroTitle.split(' ').map((word, i) => (
                <span key={i} className={i === 2 ? 'brand-text' : ''}>{word} </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl font-medium">
              {copy.heroText}
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="brand-btn px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <MessageSquare size={18} /> Contactar Ahora
              </Link>
              <Link href="#servicios" className="brand-outline px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                Explorar Servicios <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Stats Floating Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/10 pt-12 max-w-4xl">
            {[
              { val: units?.length || 0, lab: "Unidades" },
              { val: "24/7", lab: "Monitoreo" },
              { val: "100%", lab: "Seguro" },
              { val: "+15", lab: "Años Exp" }
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl md:text-5xl font-black text-white">{s.val}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{s.lab}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID (DENSIDAD) --- */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 snap-x snap-mandatory hide-scrollbar pb-8">
            <div className="min-w-[85vw] md:min-w-0 snap-center shrink-0 feature-card">
              <div className="w-16 h-16 rounded-2xl brand-bg/10 flex items-center justify-center brand-text mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Seguridad Certificada</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Cada unidad cuenta con protocolos de seguridad rigurosos y monitoreo satelital activo para su tranquilidad.</p>
            </div>
            <div className="min-w-[85vw] md:min-w-0 snap-center shrink-0 feature-card">
              <div className="w-16 h-16 rounded-2xl brand-bg/10 flex items-center justify-center brand-text mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Puntualidad Absoluta</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Entendemos el valor del tiempo. Nuestros procesos logísticos garantizan llegadas exactas en cada compromiso.</p>
            </div>
            <div className="min-w-[85vw] md:min-w-0 snap-center shrink-0 feature-card">
              <div className="w-16 h-16 rounded-2xl brand-bg/10 flex items-center justify-center brand-text mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Tecnología de Punta</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Plataforma digital integrada para el rastreo y gestión eficiente de todas nuestras operaciones en tiempo real.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="content" className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] brand-text">Trayectoria y Confianza</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                {copy.aboutTitle}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                {copy.aboutText}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 brand-text">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Misión</span>
                  </div>
                  <p className="text-sm text-slate-500">{copy.mission}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 brand-text">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Visión</span>
                  </div>
                  <p className="text-sm text-slate-500">{copy.vision}</p>
                </div>
              </div>

              <div className="pt-8">
                <Link href={vcardUrl} download={`${tenant.name}_Contacto.vcf`} className="brand-btn px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest inline-flex items-center gap-3">
                  <Download size={18} /> Descargar Tarjeta Digital
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 brand-bg/5 rounded-[40px] rotate-3" />
              <img src={aboutImg} alt="Logistics" className="relative rounded-[40px] w-full aspect-[4/5] object-cover shadow-2xl" />
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 hidden md:block">
                <p className="text-5xl font-black brand-text">{units?.length || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidades Listas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FULL WIDTH VIDEO SECTION --- */}
      {vcard.video_url && (
        <section id="video" className="section-dark py-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand/10" />
          <div className="container mx-auto px-0 md:px-12 py-24 md:py-32 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16 space-y-4 px-6">
                <p className="text-xs font-black uppercase tracking-[0.4em] brand-text">Comercial Corporativo</p>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Nuestra Operación <span className="text-white/30 italic">en Movimiento</span></h2>
              </div>
              <div className="relative aspect-video rounded-3xl md:rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 group">
                <iframe 
                  src={getEmbedUrl(vcard.video_url)} 
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
              <div className="mt-12 flex justify-center gap-12 px-6">
                 <div className="text-center">
                    <p className="text-3xl font-black text-white">100%</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Tecnología</p>
                 </div>
                 <div className="text-center">
                    <p className="text-3xl font-black text-white">HD</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Vigilancia</p>
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- SERVICES GRID --- */}
      <section id="servicios" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] brand-text">Portafolio</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                Servicios <br /> Especializados
              </h2>
            </div>
            <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">
              Ofrecemos soluciones integrales adaptadas a la medida de cada cliente, garantizando seguridad y eficiencia.
            </p>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            {services.map((svc: string, i: number) => {
              const imgs = [
                 'https://images.unsplash.com/photo-1519003722824-194d4455a60c',
                 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7',
                 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
                 'https://images.unsplash.com/photo-1504856637682-1e96a40a5a67'
              ];
              const bgImg = imgs[i % imgs.length];
              return (
                <div key={i} className="min-w-[85vw] md:min-w-0 snap-center shrink-0 relative h-[400px] rounded-[32px] overflow-hidden group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${bgImg}?q=80&w=600&auto=format&fit=crop')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center z-10">
                    <h4 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{svc.replace('• ', '')}</h4>
                    <p className="text-xs text-white/70 leading-relaxed mb-6">Operación logística optimizada con estándares de seguridad internacional.</p>
                    <Link href={`https://wa.me/${tenant.whatsapp_number}?text=Hola,%20me%20interesa%20el%20servicio:%20${encodeURIComponent(svc.replace('• ', ''))}`} target="_blank" className="w-[90%] py-4 rounded-xl bg-white text-black text-center font-black text-xs uppercase tracking-widest hover:bg-brand hover:text-white transition-colors">
                      Cotizar Ahora
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FLEET DIRECTORY --- */}
      {units && units.length > 0 && (
        <section id="unidades" className="py-24 md:py-32 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 opacity-50" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
             <Globe className="w-full h-full scale-150 rotate-12" />
          </div>
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="mb-16">
              <p className="text-xs font-black uppercase tracking-[0.3em] brand-text">Directorio en Vivo</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Estado de la Flota</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {units.map((unit: any) => (
                <div key={unit.id} className="relative bg-white/5 border border-white/10 p-6 rounded-[24px] hover:border-brand/50 transition-all group overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand/10 rounded-full blur-2xl group-hover:bg-brand/20 transition-all" />
                   <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:brand-text group-hover:bg-brand/10 transition-colors">
                        <Car size={24} />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Activa</span>
                      </div>
                   </div>
                   <div className="relative z-10 space-y-1">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Unidad</p>
                     <p className="text-3xl font-black text-white">{unit.unit_code}</p>
                   </div>
                   {unit.unit_number && (
                     <p className="text-xs font-medium text-white/50 mt-4 relative z-10">{unit.unit_number}</p>
                   )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- GOOGLE REVIEWS Hub --- */}
      <section className="py-24 md:py-32 container mx-auto px-6 md:px-12 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-4">
             <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill={brand} className="brand-text" />)}
             </div>
             <div className="py-4">
               <p className="text-[100px] md:text-[140px] font-black leading-[0.8] tracking-tighter brand-text">5.0</p>
             </div>
             <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">Excelencia Validada por Usuarios</h3>
          </div>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 snap-x snap-mandatory hide-scrollbar py-10 text-left">
             {[
               { n: "Roberto García", t: "El mejor servicio de la ciudad. Puntualidad impecable." },
               { n: "Lucía Méndez", t: "Unidades muy limpias y conductores profesionales. 100% recomendado." },
               { n: "Ing. Carlos Ruiz", t: "Aliados estratégicos para nuestra logística empresarial." }
             ].map((r, i) => (
               <div key={i} className="min-w-[85vw] md:min-w-0 snap-center shrink-0 p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all">
                  <p className="text-sm italic text-slate-600 mb-6">"{r.t}"</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900">{r.n}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- LOCATION & SOCIAL --- */}
      <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.3em] brand-text">Contacto Directo</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9]">
                  Ubícanos y <br/> Conecta
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Visita nuestras oficinas centrales o escríbenos a través de nuestras redes. Estamos disponibles para brindarte la mejor atención.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl brand-bg/10 flex items-center justify-center brand-text shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dirección Principal</p>
                    <p className="text-sm font-bold text-slate-900">{vcard.address || 'Sede Central'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl brand-bg/10 flex items-center justify-center brand-text shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Atención al Cliente</p>
                    <p className="text-sm font-bold text-slate-900">+{tenant.whatsapp_number}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Redes Sociales</p>
                <div className="flex flex-wrap gap-4">
                  {socials.map(s => (
                    <Link key={s.id} href={s.url} target="_blank" className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all">
                      <s.icon size={28} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative aspect-square md:aspect-[4/3] w-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              {vcard.google_maps_url ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/40" />
                  
                  <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full brand-bg flex items-center justify-center text-white mb-6 shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-bounce">
                      <MapPin size={32} />
                    </div>
                    <Link href={vcard.google_maps_url} target="_blank" className="bg-white text-slate-900 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 hover:text-white transition-colors">
                      Abrir en Google Maps
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                   <div className="text-center text-slate-400">
                     <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                     <p className="text-xs font-bold uppercase tracking-widest">Ubicación No Disponible</p>
                   </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="section-dark pt-16 pb-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pb-12 border-b border-white/5">
            <div className="space-y-8">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-12 w-auto grayscale brightness-200" />
              ) : (
                <span className="text-2xl font-black text-white">{tenant.name}</span>
              )}
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                Transformando el transporte cooperativo con tecnología, seguridad y compromiso humano.
              </p>
              <div className="flex gap-4">
                {socials.map(s => (
                  <Link key={s.id} href={s.url} target="_blank" className="social-circle">
                    <s.icon size={20} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-xs font-black uppercase tracking-widest text-white/20">Información</p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center brand-text shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Sede Principal</p>
                    <p className="text-sm font-medium">{vcard.address || 'Ecuador'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center brand-text shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</p>
                    <p className="text-sm font-medium">{vcard.email || `info@${tenant.name.toLowerCase().replace(/\s/g, '')}.com`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 flex flex-col items-center gap-6 mt-12">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">
              Diseñado por <Link href="https://www.cesarreyesjaramillo.com/" target="_blank" className="text-white hover:brand-text transition-colors">César Reyes</Link>
            </p>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              © {new Date().getFullYear()} {tenant.name}. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors">Legal</Link>
              <Link href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors">Privacidad</Link>
              <Link href="https://www.activaqr.com" target="_blank" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:brand-text transition-colors">Powered by ActivaQR</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
