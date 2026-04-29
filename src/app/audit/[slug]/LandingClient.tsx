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
  socials: any[];
  vcardUrl: string;
}

export default function LandingClient({ 
  tenant, units, copy, brand, brandRgb, brandContrast, vcard, services, socials, vcardUrl 
}: LandingClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
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

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .brand-bg { background-color: ${brand}; color: ${brandContrast}; }
        .brand-text { color: ${brand}; }
        .brand-border { border-color: ${brand}; }
        .brand-btn { background-color: ${brand}; color: ${brandContrast}; transition: all 0.3s ease; }
        .brand-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(${brandRgb}, 0.2); }
        .brand-outline { border: 2px solid ${brand}; color: ${brand}; transition: all 0.3s ease; }
        .brand-outline:hover { background-color: ${brand}; color: ${brandContrast}; }
        .whatsapp-btn { background-color: #25D366; color: white; transition: all 0.3s ease; }
        .whatsapp-btn:hover { background-color: #22c35e; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3); }
        .section-dark { background-color: #0f172a; color: white; }
        .glass-header { 
          background: ${scrolled ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.4)'}; 
          backdrop-filter: blur(12px); 
          border-bottom: ${scrolled ? `2px solid ${brand}` : '1px solid rgba(255,255,255,0.1)'};
          transition: all 0.4s ease;
        }
        .hero-gradient {
          background: linear-gradient(to right, #0f172a 35%, #0f172a 45%, rgba(15, 23, 42, 0.3) 70%, transparent 100%);
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
          padding: 40px; border-radius: 20px; background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; border: 1px solid #f1f5f9;
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
          <Link href="#servicios" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Servicios</Link>
          <Link href="#video" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Corporativo</Link>
          <Link href="#unidades" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">Flota</Link>
        </div>
        <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="brand-btn px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
          Soporte 24/7
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-right md:bg-center transition-all duration-1000" style={{ backgroundImage: `url('${heroDesktop}')` }} />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full brand-bg animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{copy.heroSubtitle}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase">
              {copy.heroTitle.split(' ').map((word: string, i: number) => (
                <span key={i} className={i === 2 ? 'brand-text' : ''}>{word}<br className="hidden md:block" /> </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl font-medium">
              {copy.heroText}
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="whatsapp-btn px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <MessageSquare size={18} /> Contactar Ahora
              </Link>
              <Link href="#servicios" className="brand-outline px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3">
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

      {/* --- Rest of sections remain same but integrated --- */}
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

      {/* --- VIDEO SECTION --- */}
      {vcard.video_url && (
        <section id="video" className="section-dark py-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand/10" />
          <div className="container mx-auto px-0 md:px-12 py-24 md:py-32 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-16">
              <div className="space-y-4 px-6">
                <p className="text-xs font-black uppercase tracking-[0.4em] brand-text">Comercial Corporativo</p>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Nuestra Operación <span className="text-white/30 italic">en Movimiento</span></h2>
              </div>
              <div className="relative aspect-video rounded-3xl md:rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10">
                <iframe src={getEmbedUrl(vcard.video_url)} className="w-full h-full" allowFullScreen />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- FOOTER SLIM --- */}
      <footer className="section-dark pt-12 pb-8 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
             {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-auto grayscale brightness-200 opacity-50" />
              ) : (
                <span className="text-xl font-black text-white/20 uppercase">{tenant.name}</span>
              )}
              <div className="flex gap-6">
                {socials.map(s => (
                  <Link key={s.id} href={s.url} target="_blank" className="text-white/20 hover:text-brand transition-colors">
                    <s.icon size={20} />
                  </Link>
                ))}
              </div>
          </div>
          <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {tenant.name} | Powered by ActivaQR
          </p>
        </div>
      </footer>
    </div>
  );
}
