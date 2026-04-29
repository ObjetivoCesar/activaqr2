'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Phone, MapPin, Download, Star, ChevronRight, 
  Car, Shield, Clock, Globe, Zap, Award, CheckCircle2, 
  Users, Mail, Play, ExternalLink
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsappIcon, TiktokIcon } from '@/components/SocialIcons';
import Link from 'next/link';

interface LandingClientProps {
  tenant: any;
  units: any[];
  copy: any;
  brand: string;
  brandRgb: string;
  brandContrast: string;
  vcard: any;
  services: string[];
  socialLinks: { id: string, url: string, label: string }[];
  vcardUrl: string;
}

export default function LandingClient({ 
  tenant, units, copy, brand, brandRgb, brandContrast, vcard, services, socialLinks, vcardUrl 
}: LandingClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroDesktop = vcard.hero_desktop_url || 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop';
  const aboutImg = vcard.about_image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop';

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }
    return url;
  };

  const IconMap: Record<string, any> = {
    instagram: InstagramIcon,
    whatsapp: WhatsappIcon,
    facebook: FacebookIcon,
    tiktok: TiktokIcon
  };

  return (
    <div 
      className="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white" 
      style={{ 
        '--brand-color': brand,
        '--brand-rgb': brandRgb,
        '--brand-contrast': brandContrast,
        fontFamily: "'Inter', system-ui, sans-serif" 
      } as React.CSSProperties}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex items-center justify-between transition-all duration-300 backdrop-blur-md ${
          scrolled ? 'bg-slate-900 border-b-2 shadow-2xl' : 'bg-transparent border-b border-white/5'
        }`}
        style={{ borderBottomColor: scrolled ? brand : 'transparent' }}
      >
        <div className="flex items-center gap-4">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
          ) : (
            <span className="text-xl font-black text-white uppercase tracking-tighter">
              {tenant.name} <span style={{ color: brand }}>.</span>
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#servicios" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Servicios</Link>
          <Link href="#unidades" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Flota</Link>
          <Link href="#contacto" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Contacto</Link>
        </div>
        <Link 
          href={`https://wa.me/${tenant.whatsapp_number}`} 
          target="_blank" 
          className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
          style={{ backgroundColor: brand, color: brandContrast }}
        >
          Soporte 24/7
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-right md:bg-center transition-all duration-1000" style={{ backgroundImage: `url('${heroDesktop}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent md:from-slate-950 md:via-slate-950/60" />
        
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brand }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{copy.heroSubtitle}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase drop-shadow-2xl">
              {copy.heroTitle.split(' ').map((word: string, i: number) => (
                <span key={i} style={{ color: i === 2 ? brand : 'inherit' }}>{word}<br className="hidden md:block" /> </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl font-medium">
              {copy.heroText}
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Link 
                href={`https://wa.me/${tenant.whatsapp_number}`} 
                target="_blank" 
                className="bg-[#25D366] hover:bg-[#22c35e] px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 text-white transition-all hover:-translate-y-1 shadow-lg shadow-green-500/30"
              >
                <MessageSquare size={18} /> Contactar Ahora
              </Link>
              <Link href="#servicios" className="px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-white/10 border-2" style={{ borderColor: brand, color: brand }}>
                Explorar Servicios <ChevronRight size={18} />
              </Link>
            </div>
          </div>

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

      {/* --- ABOUT SECTION (CONTRASTE: FONDO BLANCO = LETRAS AZULES) --- */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>Trayectoria y Confianza</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]" style={{ color: brand }}>{copy.aboutTitle}</h2>
              <p className="text-slate-600 text-lg leading-relaxed">{copy.aboutText}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2" style={{ color: brand }}><CheckCircle2 size={20} /> <span className="text-xs font-black uppercase text-slate-900">Misión</span></div>
                  <p className="text-sm text-slate-500">{copy.mission}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2" style={{ color: brand }}><CheckCircle2 size={20} /> <span className="text-xs font-black uppercase text-slate-900">Visión</span></div>
                  <p className="text-sm text-slate-500">{copy.vision}</p>
                </div>
              </div>
              <Link href={vcardUrl} download className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all" style={{ backgroundColor: brand, color: brandContrast }}>
                <Download size={18} /> Descargar Tarjeta Digital
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[40px] rotate-3 opacity-10" style={{ backgroundColor: brand }} />
              <img src={aboutImg} alt="About" className="relative rounded-[40px] w-full aspect-[4/5] object-cover shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID (CONTRASTE: FONDO GRIS CLARO = LETRAS AZULES) --- */}
      <section id="servicios" className="py-24 md:py-32 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 space-y-4 text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>Portafolio</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]" style={{ color: brand }}>Servicios Especializados</h2>
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
                <div key={i} className="min-w-[85vw] md:min-w-0 snap-center shrink-0 relative h-[450px] rounded-[32px] overflow-hidden group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${bgImg}?q=80&w=600&auto=format&fit=crop')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-white">{svc.replace('• ', '')}</h4>
                    <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="w-full py-4 rounded-xl bg-white text-black text-center font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                      Cotizar Ahora
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- VIDEO SECTION --- */}
      {vcard.video_url && (
        <section id="video" className="bg-slate-900 py-24 text-white overflow-hidden">
          <div className="container mx-auto px-6 text-center space-y-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Operación <span className="text-white/30 italic">en Vivo</span></h2>
            <div className="max-w-5xl mx-auto rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
              <iframe src={getEmbedUrl(vcard.video_url)} className="w-full aspect-video" allowFullScreen />
            </div>
          </div>
        </section>
      )}

      {/* --- FLEET DIRECTORY (CONTRASTE: FONDO BLANCO = LETRAS AZULES) --- */}
      <section id="unidades" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>Directorio de Flota</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase" style={{ color: brand }}>Estado de Unidades</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {(units || []).slice(0, 10).map((unit: any) => (
              <div key={unit.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[24px] hover:border-brand/30 transition-all group">
                <div className="flex items-center justify-between mb-8">
                  <Car size={24} style={{ color: brand }} />
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-500/10 text-green-600 rounded-md">Activa</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidad</p>
                <p className="text-3xl font-black text-slate-900">{unit.unit_code}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- GOOGLE REVIEWS (STYLE ACTIVAQR 1 - DARK CARDS) --- */}
      <section className="py-24 md:py-32 bg-slate-950 text-white overflow-hidden">
        <div className="container mx-auto px-6 text-center space-y-12">
           <div className="space-y-4">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#fbbf24" className="text-[#fbbf24]" />)}
              </div>
              <p className="text-7xl md:text-9xl font-black tracking-tighter leading-none" style={{ color: brand }}>5.0</p>
              <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white/60">4 RESEÑAS EN <span className="text-brand" style={{ color: brand }}>GOOGLE BUSINESS</span></h3>
           </div>
          
           <p className="text-sm italic text-white/40 max-w-2xl mx-auto">"Gracias a nuestra comunidad por calificarnos con 5 estrellas. ¡Tu opinión nos ayuda a crecer!"</p>

           <div className="flex overflow-x-auto gap-6 snap-x hide-scrollbar py-8 max-w-6xl mx-auto text-left">
            {[
              { n: "Guido Daniel Rojas", t: "Excelente servicio, recomendado 🤝", img: "https://i.pravatar.cc/150?u=guido" },
              { n: "Patricio Reyes", t: "Excelente. Te asesora y permite mejorar tus productos", img: "https://i.pravatar.cc/150?u=patricio" },
              { n: "Astrid Davila", t: "Me encantó el trabajo que realizó. Fue muy profesional, paciente y...", img: "https://i.pravatar.cc/150?u=astrid" }
            ].map((r, i) => (
              <div key={i} className="min-w-[85vw] md:min-w-[380px] snap-center p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-4">
                   <img src={r.img} alt={r.n} className="w-12 h-12 rounded-full border-2 border-brand" style={{ borderColor: brand }} />
                   <div>
                      <p className="text-sm font-black uppercase text-white">{r.n}</p>
                      <p className="text-[10px] text-white/40">Hace 2 meses</p>
                   </div>
                   <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#fbbf24" className="text-[#fbbf24]" />)}
                   </div>
                </div>
                <p className="text-sm italic text-white/70 leading-relaxed">"{r.t}"</p>
                <div className="flex justify-end">
                   <span className="text-[10px] font-black uppercase text-brand" style={{ color: brand }}>Ver más →</span>
                </div>
              </div>
            ))}
          </div>

          <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
             <MessageSquare size={18} className="text-brand" style={{ color: brand }} /> VER TODAS LAS RESEÑAS Y CÓMO LLEGAR
          </Link>
        </div>
      </section>

      {/* --- CONTACT & MAP (CONTRASTE: FONDO BLANCO = LETRAS AZULES) --- */}
      <section id="contacto" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>Contacto</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]" style={{ color: brand }}>Ubícanos y Conecta</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <MapPin size={24} style={{ color: brand }} />
                <div><p className="text-[10px] font-black uppercase text-slate-400">Dirección</p><p className="text-sm font-bold text-slate-900">{vcard.address || 'Quito, Ecuador'}</p></div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Phone size={24} style={{ color: brand }} />
                <div><p className="text-[10px] font-black uppercase text-slate-400">WhatsApp</p><p className="text-sm font-bold text-slate-900">+{tenant.whatsapp_number}</p></div>
              </div>
            </div>
            <div className="flex gap-4">
              {socialLinks.map(s => {
                const Icon = IconMap[s.id] || Globe;
                return (
                  <Link key={s.id} href={s.url} target="_blank" className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center hover:scale-110 transition-all" style={{ color: brand }}>
                    <Icon size={28} />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="aspect-square bg-slate-900 rounded-[40px] overflow-hidden relative group">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover opacity-40 transition-transform duration-1000 group-hover:scale-110" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Link href={vcard.google_maps_url || '#'} target="_blank" className="px-8 py-4 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Abrir Mapa</Link>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 py-12 text-white/30 text-center border-t border-white/5">
        <div className="container mx-auto px-6 space-y-8">
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">© {new Date().getFullYear()} {tenant.name} | ActivaQR Ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
