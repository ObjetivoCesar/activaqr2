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
      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex items-center justify-between transition-all duration-300 backdrop-blur-md ${
          scrolled ? 'bg-slate-900/95 border-b-2 shadow-xl' : 'bg-slate-800/20 border-b border-white/5'
        }`}
        style={{ borderBottomColor: scrolled ? brand : 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="h-10 md:h-12 w-auto object-contain" />
          ) : (
            <span className="text-xl font-black text-white uppercase tracking-tighter">
              {tenant.name} <span style={{ color: brand }}>.</span>
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#servicios" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Servicios</Link>
          <Link href="#video" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Corporativo</Link>
          <Link href="#unidades" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Flota</Link>
        </div>
        <Link 
          href={`https://wa.me/${tenant.whatsapp_number}`} 
          target="_blank" 
          className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: brand, color: brandContrast }}
        >
          Soporte 24/7
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-right md:bg-center transition-all duration-1000" style={{ backgroundImage: `url('${heroDesktop}')` }} />
        {/* REFINED GRADIENT: Dark left, Fade to Transparent Right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent md:from-slate-950 md:via-slate-950/60" />
        
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brand }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{copy.heroSubtitle}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase">
              {copy.heroTitle.split(' ').map((word: string, i: number) => (
                <span key={i} style={{ color: i === 2 ? brand : 'inherit' }}>{word}<br className="hidden md:block" /> </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl font-medium">
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
              <Link 
                href="#servicios" 
                className="px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-white/10 border-2"
                style={{ borderColor: brand, color: brand }}
              >
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

      {/* --- Rest of content using internal Icon mapping --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 text-center">
           <h2 className="text-2xl font-black uppercase tracking-widest mb-12">Nuestra Propuesta de Valor</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, t: "Seguridad Certificada", d: "Protocolos internacionales de protección." },
                { icon: Clock, t: "Puntualidad Absoluta", d: "Gestión de tiempos optimizada por IA." },
                { icon: Zap, t: "Tecnología Real-Time", d: "Rastreo y control total desde su móvil." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                   <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brand}15`, color: brand }}>
                      <f.icon size={24} />
                   </div>
                   <h3 className="font-black uppercase mb-4 text-sm">{f.t}</h3>
                   <p className="text-xs text-slate-500 leading-relaxed">{f.d}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- VIDEO --- */}
      {vcard.video_url && (
        <section id="video" className="bg-slate-900 py-24 text-white">
           <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                 <iframe src={getEmbedUrl(vcard.video_url)} className="w-full aspect-video" allowFullScreen />
              </div>
           </div>
        </section>
      )}

      {/* --- FOOTER CLEAN --- */}
      <footer className="bg-slate-950 py-12 text-white border-t border-white/5">
        <div className="container mx-auto px-6 text-center space-y-8">
           <div className="flex justify-center gap-4">
              {socialLinks.map(s => {
                const Icon = IconMap[s.id] || Globe;
                return (
                  <Link key={s.id} href={s.url} target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                    <Icon size={18} />
                  </Link>
                );
              })}
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
              © {new Date().getFullYear()} {tenant.name} | ActivaQR Ecosystem
           </p>
        </div>
      </footer>
    </div>
  );
}
