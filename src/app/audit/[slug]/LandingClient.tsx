'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Phone, MapPin, Download, Star, ChevronRight, 
  Car, Shield, Clock, Globe, Zap, Award, CheckCircle2, 
  Users, Mail, Play, ExternalLink, ChevronLeft
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
  const [activeAboutImg, setActiveAboutImg] = useState(0);

  // Detectar el tipo de layout por el slug o propiedad en vcard
  const layoutType = vcard.layout_type || (tenant.slug.includes('hotel') || tenant.slug.includes('luxury') ? 'luxury' : tenant.slug.includes('taxi') ? 'fleet' : 'standard');

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroDesktop = vcard.hero_desktop_url || 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop';
  const aboutImgs = vcard.about_images || [vcard.about_image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop'];

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
        <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105" style={{ backgroundColor: brand, color: brandContrast }}>Soporte 24/7</Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-right md:bg-center transition-all duration-1000" style={{ backgroundImage: `url('${heroDesktop}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent md:from-slate-950 md:via-slate-950/60" />
        
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-20">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">{copy.heroSubtitle}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase">
              {copy.heroTitle.split(' ').map((word: string, i: number) => {
                if (word.toLowerCase() === 'logistics' || word.toLowerCase() === 'luxury' || word.toLowerCase() === 'premium') {
                  return (
                    <span key={i} className="inline-block bg-white text-slate-950 px-4 md:px-6 py-1 rounded-2xl transform -skew-x-6 mr-4 mb-2">
                      {word}
                    </span>
                  );
                }
                return <span key={i} className="mr-4 inline-block">{word} </span>;
              })}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl font-medium">
              {copy.heroText}
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="bg-[#25D366] hover:bg-[#22c35e] px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 text-white transition-all hover:-translate-y-1 shadow-lg shadow-green-500/30"><MessageSquare size={18} /> Contactar Ahora</Link>
              <Link href="#servicios" className="px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-white/10 border-2" style={{ borderColor: brand, color: brand }}>Explorar Servicios <ChevronRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (VARIACIÓN: SLIDER PARA FLEET) --- */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>Identidad Corporativa</p>
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
            </div>

            {/* SLIDER O IMAGEN ÚNICA SEGÚN LAYOUT */}
            <div className="relative group">
              <div className="absolute -inset-4 rounded-[40px] rotate-3 opacity-10" style={{ backgroundColor: brand }} />
              <div className="relative rounded-[40px] overflow-hidden aspect-[4/5] shadow-2xl">
                {layoutType === 'fleet' && aboutImgs.length > 1 ? (
                  <>
                    <img src={aboutImgs[activeAboutImg]} alt="About" className="w-full h-full object-cover transition-opacity duration-700" />
                    <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2">
                      {aboutImgs.map((_: any, i: number) => (
                        <button key={i} onClick={() => setActiveAboutImg(i)} className={`w-3 h-3 rounded-full transition-all ${activeAboutImg === i ? 'w-8' : 'bg-white/50'}`} style={{ backgroundColor: activeAboutImg === i ? brand : '' }} />
                      ))}
                    </div>
                  </>
                ) : (
                  <img src={aboutImgs[0]} alt="About" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION (VARIACIÓN: CAROUSEL FLOTANTE PARA LUXURY) --- */}
      <section id="servicios" className={`py-24 md:py-32 ${layoutType === 'luxury' ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 space-y-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: brand }}>Nuestras Soluciones</p>
            <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] ${layoutType === 'luxury' ? 'text-white' : 'text-slate-900'}`}>Servicios Especializados</h2>
          </div>
          
          <div className={`flex gap-6 pb-8 snap-x snap-mandatory hide-scrollbar ${layoutType === 'luxury' ? 'justify-center overflow-visible' : 'overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4'}`}>
            {services.map((svc: string, i: number) => {
              const imgs = [
                 'https://images.unsplash.com/photo-1519003722824-194d4455a60c',
                 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7',
                 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
                 'https://images.unsplash.com/photo-1504856637682-1e96a40a5a67'
              ];
              const bgImg = imgs[i % imgs.length];
              return (
                <div key={i} className={`snap-center shrink-0 relative rounded-[32px] overflow-hidden group shadow-2xl transition-all duration-500 ${layoutType === 'luxury' ? 'min-w-[300px] h-[500px] hover:-translate-y-4' : 'min-w-[85vw] md:min-w-0 h-[450px]'}`}>
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${bgImg}?q=80&w=600&auto=format&fit=crop')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-white">{svc.replace('• ', '')}</h4>
                    <Link href={`https://wa.me/${tenant.whatsapp_number}`} target="_blank" className="w-full py-4 rounded-xl bg-white text-black text-center font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cotizar</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- VIDEO SECTION (VARIACIÓN: ANCHO COMPLETO PARA LUXURY) --- */}
      {vcard.video_url && (
        <section id="video" className={`bg-slate-900 text-white overflow-hidden ${layoutType === 'luxury' ? 'py-0 h-screen' : 'py-24'}`}>
          <div className={`${layoutType === 'luxury' ? 'w-full h-full' : 'container mx-auto px-6 text-center space-y-16'}`}>
            {layoutType !== 'luxury' && <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Operación <span className="text-white/30 italic">en Vivo</span></h2>}
            <div className={`${layoutType === 'luxury' ? 'w-full h-full' : 'max-w-5xl mx-auto rounded-[40px] overflow-hidden shadow-2xl border border-white/10'}`}>
              <iframe src={getEmbedUrl(vcard.video_url)} className="w-full h-full aspect-video" allowFullScreen />
            </div>
          </div>
        </section>
      )}

      {/* --- REVIEWS (STYLE ACTIVAQR 1) --- */}
      <section className="py-24 md:py-32 bg-slate-950 text-white">
        <div className="container mx-auto px-6 text-center space-y-12">
           <div className="space-y-4">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#fbbf24" className="text-[#fbbf24]" />)}
              </div>
              <p className="text-8xl md:text-[140px] font-black tracking-tighter leading-none" style={{ color: brand }}>{vcard.rating || '5.0'}</p>
              <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white/60">{vcard.review_count || '12'} RESEÑAS EN <span style={{ color: brand }}>GOOGLE BUSINESS</span></h3>
           </div>
           <div className="flex overflow-x-auto gap-6 snap-x hide-scrollbar py-8 max-w-6xl mx-auto text-left">
            {(vcard.reviews || [
              { n: "Guido Rojas", t: "Excelente servicio, recomendado 🤝", img: "https://i.pravatar.cc/150?u=1" },
              { n: "Patricio Reyes", t: "Te asesora y permite mejorar tus productos", img: "https://i.pravatar.cc/150?u=2" },
              { n: "Astrid Davila", t: "Trabajo muy profesional y paciente.", img: "https://i.pravatar.cc/150?u=3" }
            ]).map((r: any, i: number) => (
              <div key={i} className="min-w-[85vw] md:min-w-[380px] snap-center p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-4">
                   <img src={r.img} className="w-12 h-12 rounded-full border-2" style={{ borderColor: brand }} />
                   <div><p className="text-sm font-black uppercase">{r.n}</p><p className="text-[10px] text-white/40">Hace 2 meses</p></div>
                   <div className="ml-auto flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#fbbf24" className="text-[#fbbf24]" />)}</div>
                </div>
                <p className="text-sm italic text-white/70">"{r.t}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT & MAP (VARIACIÓN: MAPA ANCHO COMPLETO PARA FLEET) --- */}
      <section id="contacto" className={`py-24 md:py-32 bg-white ${layoutType === 'fleet' ? 'pb-0' : ''}`}>
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]" style={{ color: brand }}>Ubícanos y Conecta</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <MapPin size={24} style={{ color: brand }} />
                <div><p className="text-[10px] font-black uppercase text-slate-400">Dirección</p><p className="text-sm font-bold text-slate-900">{vcard.address}</p></div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Phone size={24} style={{ color: brand }} />
                <div><p className="text-[10px] font-black uppercase text-slate-400">WhatsApp</p><p className="text-sm font-bold text-slate-900">+{tenant.whatsapp_number}</p></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(s => {
                const Icon = IconMap[s.id] || Globe;
                const colors: Record<string, string> = { whatsapp: 'bg-[#25D366]', instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', facebook: 'bg-[#1877F2]', tiktok: 'bg-[#000000]' };
                return (
                  <Link key={s.id} href={s.url} target="_blank" className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all ${colors[s.id] || 'bg-slate-900'}`}>
                    <Icon size={24} />
                  </Link>
                );
              })}
            </div>
          </div>
          {layoutType !== 'fleet' && (
            <div className="aspect-square bg-slate-900 rounded-[40px] overflow-hidden relative group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover opacity-40" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Link href={vcard.google_maps_url || '#'} target="_blank" className="px-8 py-4 bg-white text-slate-900 rounded-xl text-xs font-black uppercase shadow-2xl hover:scale-105 transition-all">Ver Mapa</Link>
               </div>
            </div>
          )}
        </div>
        {layoutType === 'fleet' && (
          <div className="w-full h-[500px] mt-24 bg-slate-900 relative">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')] bg-cover opacity-60" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Link href={vcard.google_maps_url || '#'} target="_blank" className="px-12 py-6 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-110 transition-all">Explorar Cobertura Completa</Link>
             </div>
          </div>
        )}
      </section>

      <footer className="bg-slate-950 py-12 text-white/30 text-center border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">© {new Date().getFullYear()} {tenant.name} | ActivaQR Pro</p>
      </footer>
    </div>
  );
}
