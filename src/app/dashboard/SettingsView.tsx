'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { updateTenantAction } from '@/app/actions/tenant-actions';
import { 
  Settings, 
  Palette, 
  Phone, 
  Mail, 
  Bell, 
  Save, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Share2,
  Camera,
  Briefcase,
  Music,
  Globe,
  Layout,
  FileText,
  Zap,
  MapPin,
  Monitor,
  Smartphone,
  Video,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  FacebookIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  TwitterIcon, 
  YoutubeIcon, 
  TiktokIcon, 
  WhatsappIcon 
} from '@/components/SocialIcons';

const extractDominantColor = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("#2563eb");
      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      
      const colorMap = new Map<string, {r: number, g: number, b: number, count: number}>();
      let maxCount = 0;
      let r = 37, g = 99, b = 235;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) {
           const pr = data[i], pg = data[i+1], pb = data[i+2];
           const isWhite = pr > 230 && pg > 230 && pb > 230;
           const isBlack = pr < 40 && pg < 40 && pb < 40;
           const isGray = Math.abs(pr - pg) < 25 && Math.abs(pg - pb) < 25 && Math.abs(pr - pb) < 25;

           if (!isWhite && !isBlack && !isGray) {
              const roundedR = Math.round(pr / 24) * 24;
              const roundedG = Math.round(pg / 24) * 24;
              const roundedB = Math.round(pb / 24) * 24;
              const key = `${roundedR},${roundedG},${roundedB}`;
              
              const current = colorMap.get(key) || {r: 0, g: 0, b: 0, count: 0};
              current.r += pr;
              current.g += pg;
              current.b += pb;
              current.count += 1;
              colorMap.set(key, current);

              if (current.count > maxCount) {
                 maxCount = current.count;
                 r = Math.round(current.r / current.count);
                 g = Math.round(current.g / current.count);
                 b = Math.round(current.b / current.count);
              }
           }
        }
      }

      const toHex = (c: number) => c.toString(16).padStart(2, '0');
      resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve("#2563eb");
  });
};

interface SettingsViewProps {
  tenant: any;
  brandColor: string;
  units?: any[];
}

export default function SettingsView({ tenant, brandColor, units }: SettingsViewProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState(() => {
    let parsedVcard: any = {};
    try {
      if (tenant?.vcard_name?.startsWith('{')) {
        parsedVcard = JSON.parse(tenant.vcard_name);
      } else {
        parsedVcard.name = tenant?.vcard_name || '';
      }
    } catch(e) {}

    return {
      name: tenant?.name || '',
      brand_color: tenant?.brand_color || '#2563eb',
      logo_url: tenant?.logo_url || '',
      whatsapp_number: tenant?.whatsapp_number || '',
      linked_email: tenant?.linked_email || '',
      vcard_name: parsedVcard.name || '',
      vcard_title: parsedVcard.title || '',
      vcard_website: parsedVcard.website || '',
      vcard_address: parsedVcard.address || '',
      slug: parsedVcard.slug || '',
      description: parsedVcard.description || '',
      services: Array.isArray(parsedVcard.services) ? parsedVcard.services : (parsedVcard.services ? parsedVcard.services.split('\n').filter(Boolean) : []),
      facebook: parsedVcard.facebook || '',
      instagram: parsedVcard.instagram || '',
      linkedin: parsedVcard.linkedin || '',
      tiktok: parsedVcard.tiktok || '',
      twitter: parsedVcard.twitter || '',
      youtube: parsedVcard.youtube || '',
      whatsapp_url: parsedVcard.whatsapp_url || '',
      hero_desktop_url: parsedVcard.hero_desktop_url || '',
      hero_mobile_url: parsedVcard.hero_mobile_url || '',
      video_url: parsedVcard.video_url || '',
      about_image_url: parsedVcard.about_image_url || '',
      google_maps_url: parsedVcard.google_maps_url || ''
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;
    const draftKey = `activaqr2_settings_draft_${tenant.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenant?.id || isSaving) return;
    const draftKey = `activaqr2_settings_draft_${tenant.id}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData, tenant?.id, isSaving]);

  const handleSave = async () => {
    console.log('🔘 Clic en Guardar Cambios');
    console.log('🆔 Tenant ID:', tenant?.id);
    
    if (!tenant?.id) {
      setMessage({ type: 'error', text: 'Error: No se pudo identificar la empresa (ID faltante).' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const payload = {
        name: formData.name,
        brand_color: formData.brand_color,
        logo_url: formData.logo_url,
        whatsapp_number: formData.whatsapp_number,
        linked_email: formData.linked_email,
        vcard_name: JSON.stringify({
          name: formData.vcard_name,
          title: formData.vcard_title,
          website: formData.vcard_website,
          address: formData.vcard_address,
          slug: formData.slug,
          description: formData.description,
          services: formData.services.filter((s: string) => s.trim() !== ''),
          facebook: formData.facebook,
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          tiktok: formData.tiktok,
          twitter: formData.twitter,
          youtube: formData.youtube,
          whatsapp_url: formData.whatsapp_url,
          hero_desktop_url: formData.hero_desktop_url,
          hero_mobile_url: formData.hero_mobile_url,
          video_url: formData.video_url,
          about_image_url: formData.about_image_url,
          google_maps_url: formData.google_maps_url
        })
      };

      setIsSaving(true);
      const result = await updateTenantAction(tenant.id, payload);

      if (!result.success) {
        throw new Error(result.error);
      }
      
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
      
      const draftKey = `activaqr2_settings_draft_${tenant.id}`;
      localStorage.removeItem(draftKey);
      
      // Dar tiempo para ver el mensaje antes de recargar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error saving settings:', err);
      setMessage({ type: 'error', text: 'Error al guardar: ' + (err.message || 'Error desconocido') });
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with high contrast */}
      <div className="vision-window p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border-border/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none mb-2">PERSONALIZACIÓN DE SU COOPERATIVA</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic opacity-70">Configure cómo se verá y funcionará su panel de control</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-foreground text-background px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          GUARDAR CAMBIOS
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Identity & Branding (4 cols) */}
        <div className="xl:col-span-5 space-y-8">
          <section className="vision-window p-8 bg-card border-border/40 space-y-8">
            <div className="flex items-center gap-3 border-b border-border/20 pb-4 mb-2">
              <Palette className="w-5 h-5 text-brand" />
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">IDENTIDAD VISUAL</h4>
            </div>

            <div className="space-y-8">
              {/* Nombre de la Empresa */}
              <div className="group">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand transition-colors italic">
                  NOMBRE DE LA EMPRESA / COOPERATIVA
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Michael Transportes"
                  className="w-full bg-background/50 border border-border/60 p-5 rounded-2xl text-base font-bold text-foreground focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selector de Color Mejorado */}
                <div className="group">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1 italic">
                    COLOR DE MARCA
                  </label>
                  <div className="flex items-center gap-4 bg-background/50 p-3 rounded-3xl border border-border/60">
                    <div className="relative">
                      <input 
                        type="color" 
                        value={formData.brand_color}
                        onChange={e => setFormData({...formData, brand_color: e.target.value})}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div 
                        className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg transition-transform hover:scale-105"
                        style={{ backgroundColor: formData.brand_color }}
                      />
                    </div>
                    <input 
                      type="text" 
                      value={formData.brand_color}
                      onChange={e => setFormData({...formData, brand_color: e.target.value})}
                      className="flex-1 bg-transparent border-none text-sm font-mono font-bold text-foreground focus:ring-0 outline-none uppercase tracking-widest"
                    />
                  </div>
                </div>

                {/* Nombre en VCard */}
                <div className="group">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1 italic">
                    NOMBRE EN TARJETA (VCARD)
                  </label>
                  <input 
                    type="text" 
                    value={formData.vcard_name}
                    onChange={e => setFormData({...formData, vcard_name: e.target.value})}
                    placeholder="e.g. Paulo Support"
                    className="w-full bg-background/50 border border-border/60 p-5 rounded-2xl text-sm font-bold text-foreground focus:border-brand outline-none"
                  />
                </div>
              </div>

              {/* Logo Upload con Preview Pro */}
              <div className="group">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 ml-1 italic">
                  LOGO DE LA ORGANIZACIÓN
                </label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative group/logo">
                    <button
                      type="button"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="w-32 h-32 rounded-3xl bg-background border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden transition-all hover:border-brand/50 hover:bg-brand/5 shadow-xl relative"
                    >
                      {formData.logo_url ? (
                        <img src={formData.logo_url} className="w-full h-full object-contain p-4" alt="Logo preview" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-tighter">SIN LOGO</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-brand/80 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-all duration-300">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </button>
                    
                    <input 
                      id="logo-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setLoading(true);
                          const formDataUpload = new FormData();
                          formDataUpload.append('file', file);
                          formDataUpload.append('type', 'logo');
                          const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
                          const result = await res.json();
                          if (!res.ok) throw new Error(result.error || 'Error al subir');
                          const dominantColor = await extractDominantColor(file);
                          setFormData({...formData, logo_url: result.url, brand_color: dominantColor});
                        } catch (err: any) {
                          alert("Error: " + err.message);
                        } finally { setLoading(false); }
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                      <input 
                        type="text" 
                        value={formData.logo_url}
                        onChange={e => setFormData({...formData, logo_url: e.target.value})}
                        className="w-full bg-background/50 border border-border/60 pl-12 pr-4 py-4 rounded-2xl text-xs font-bold text-foreground focus:border-brand outline-none truncate"
                        placeholder="URL del logo (https://...)"
                      />
                    </div>
                    <div className="p-4 bg-foreground/[0.02] border border-border/40 rounded-2xl">
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
                        <AlertCircle className="w-3 h-3 inline mr-1 text-brand" /> 
                        Se recomienda usar formatos <span className="text-foreground font-black">SVG</span> o <span className="text-foreground font-black">PNG transparente</span> para una visualización óptima en todos los dispositivos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="vision-window p-8 bg-card border-border/40 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-5 h-5 text-brand" />
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">REDES SOCIALES</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { id: 'facebook', icon: FacebookIcon, label: 'Facebook' },
                { id: 'instagram', icon: InstagramIcon, label: 'Instagram' },
                { id: 'linkedin', icon: LinkedinIcon, label: 'LinkedIn' },
                { id: 'twitter', icon: TwitterIcon, label: 'X / Twitter' },
                { id: 'youtube', icon: YoutubeIcon, label: 'YouTube' },
                { id: 'whatsapp_url', icon: WhatsappIcon, label: 'WhatsApp' },
                { id: 'tiktok', icon: TiktokIcon, label: 'TikTok' },
              ].map(social => (
                <div key={social.id} className="group p-4 rounded-2xl border border-border/40 bg-background/50 hover:border-brand/30 transition-all">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-border/60 text-brand focus:ring-brand accent-brand cursor-pointer"
                      checked={!!(formData as any)[social.id]}
                      onChange={e => {
                        if (!e.target.checked) {
                          setFormData({...formData, [social.id]: ''});
                        } else {
                          setFormData({...formData, [social.id]: 'https://'});
                        }
                      }}
                    />
                    <span className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                      <social.icon className="w-4 h-4" /> {social.label}
                    </span>
                  </label>
                  
                  {!!(formData as any)[social.id] && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <input 
                        type="text" 
                        value={(formData as any)[social.id]}
                        onChange={e => setFormData({...formData, [social.id]: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-background border border-border/60 p-3 rounded-xl text-xs font-bold text-foreground focus:border-brand outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Public Profile & Landing (7 cols) */}
        <div className="xl:col-span-7 space-y-8">
          <section className="vision-window p-8 bg-card border-border/40 space-y-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-brand" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-foreground">PÁGINA PÚBLICA DE SOCIOS</h4>
                </div>
                {formData.slug && (
                  <div className="flex gap-2">
                    <a href={`/?tenantId=${tenant.id}&unitId=${units?.[0]?.id || ''}`} target="_blank" className="px-3 py-1.5 rounded-full bg-brand/10 text-[9px] font-black text-brand uppercase tracking-widest hover:bg-brand hover:text-white transition-all flex items-center gap-1.5 border border-brand/20">
                      Ver Formulario <Zap className="w-3 h-3" />
                    </a>
                    <a href={`/audit/${formData.slug}`} target="_blank" className="px-3 py-1.5 rounded-full bg-foreground/5 text-[9px] font-black text-foreground uppercase tracking-widest hover:bg-foreground hover:text-background transition-all flex items-center gap-1.5 border border-border/20">
                      Página Pública <Globe className="w-3 h-3" />
                    </a>
                  </div>
                )}
             </div>

             <div className="space-y-6">
                <div className="group">
                  <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">ENLACE DE ACCESO</label>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-4 rounded-2xl bg-background border border-border/60 text-xs font-black text-muted-foreground uppercase tracking-widest">
                       your-site.com/audit/
                    </div>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      placeholder="nombre-cooperativa"
                      className="flex-1 bg-background border border-border/60 p-4 rounded-2xl text-sm font-black text-brand focus:border-brand outline-none tracking-widest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="group">
                      <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                         <FileText className="w-3 h-3 text-brand" /> DESCRIPCIÓN DE LA COOPERATIVA
                      </label>
                      <textarea 
                        rows={6}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Cuente su historia. ¿Qué hace que su flota sea la mejor?"
                        className="w-full bg-background border border-border/60 p-4 rounded-2xl text-sm font-medium text-foreground focus:border-brand outline-none resize-none leading-relaxed"
                      />
                   </div>
                   <div className="group">
                      <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                         <Zap className="w-3 h-3 text-brand" /> SERVICIOS
                      </label>
                      <div className="space-y-3">
                        {formData.services.map((svc: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-brand shrink-0">•</span>
                            <input
                              type="text"
                              value={svc}
                              onChange={(e) => {
                                const newServices = [...formData.services];
                                newServices[index] = e.target.value;
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="flex-1 bg-background border border-border/60 p-3 rounded-xl text-sm font-medium text-foreground focus:border-brand outline-none"
                              placeholder="Ej: Transporte Ejecutivo"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newServices = formData.services.filter((_: any, i: any) => i !== index);
                                setFormData({ ...formData, services: newServices });
                              }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {formData.services.length < 8 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, services: [...formData.services, ''] })}
                            className="w-full py-3 rounded-xl border border-dashed border-border/60 text-xs font-bold text-muted-foreground hover:text-brand hover:border-brand/50 hover:bg-brand/5 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Agregar Servicio
                          </button>
                        )}
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/20">
                <div className="group">
                  <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    <Video className="w-3 h-3 text-brand" /> URL VIDEO (YOUTUBE/EMBED)
                  </label>
                  <input 
                    type="text" 
                    value={formData.video_url}
                    onChange={e => setFormData({...formData, video_url: e.target.value})}
                    className="w-full bg-background border border-border/60 p-4 rounded-2xl text-xs font-bold text-foreground focus:border-brand outline-none mb-4"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    <MapPin className="w-3 h-3 text-brand" /> URL GOOGLE MAPS (RESEÑAS)
                  </label>
                  <input 
                    type="text" 
                    value={formData.google_maps_url}
                    onChange={e => setFormData({...formData, google_maps_url: e.target.value})}
                    className="w-full bg-background border border-border/60 p-4 rounded-2xl text-xs font-bold text-foreground focus:border-brand outline-none mb-4"
                    placeholder="https://goo.gl/maps/..."
                  />
                  <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    <Monitor className="w-3 h-3 text-brand" /> FONDO HERO ESCRITORIO
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={formData.hero_desktop_url}
                      onChange={e => setFormData({...formData, hero_desktop_url: e.target.value})}
                      className="flex-1 bg-background border border-border/60 p-4 rounded-2xl text-xs font-bold text-foreground focus:border-brand outline-none truncate"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('hero-desktop-upload')?.click()}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-background hover:bg-accent transition-all border border-border/60 shadow-lg group-hover:border-brand"
                    >
                      <input 
                        id="hero-desktop-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setLoading(true);
                            const formDataUpload = new FormData();
                            formDataUpload.append('file', file);
                            formDataUpload.append('type', 'hero-desktop');
                            const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.error || 'Error al subir');
                            setFormData({...formData, hero_desktop_url: result.url});
                          } catch (err: any) {
                            console.error('Upload Error:', err);
                            setMessage({ type: 'error', text: 'Error al subir: ' + err.message });
                          } finally { setLoading(false); }
                        }}
                      />
                      <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    <Smartphone className="w-3 h-3 text-brand" /> FONDO HERO MÓVIL
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={formData.hero_mobile_url}
                      onChange={e => setFormData({...formData, hero_mobile_url: e.target.value})}
                      className="flex-1 bg-background border border-border/60 p-4 rounded-2xl text-xs font-bold text-foreground focus:border-brand outline-none truncate"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('hero-mobile-upload')?.click()}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-background hover:bg-accent transition-all border border-border/60 shadow-lg group-hover:border-brand"
                    >
                      <input 
                        id="hero-mobile-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setLoading(true);
                            const formDataUpload = new FormData();
                            formDataUpload.append('file', file);
                            formDataUpload.append('type', 'hero-mobile');
                            const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.error || 'Error al subir');
                            setFormData({...formData, hero_mobile_url: result.url});
                          } catch (err: any) {
                            console.error('Upload Error:', err);
                            setMessage({ type: 'error', text: 'Error al subir: ' + err.message });
                          } finally { setLoading(false); }
                        }}
                      />
                      <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                    <ImageIcon className="w-3 h-3 text-brand" /> IMAGEN "SOBRE NOSOTROS"
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={formData.about_image_url}
                      onChange={e => setFormData({...formData, about_image_url: e.target.value})}
                      className="flex-1 bg-background border border-border/60 p-4 rounded-2xl text-xs font-bold text-foreground focus:border-brand outline-none truncate"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('about-image-upload')?.click()}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-background hover:bg-accent transition-all border border-border/60 shadow-lg group-hover:border-brand"
                    >
                      <input 
                        id="about-image-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setLoading(true);
                            const formDataUpload = new FormData();
                            formDataUpload.append('file', file);
                            formDataUpload.append('type', 'about-image');
                            const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.error || 'Error al subir');
                            setFormData({...formData, about_image_url: result.url});
                          } catch (err: any) {
                            console.error('Upload Error:', err);
                            setMessage({ type: 'error', text: 'Error al subir: ' + err.message });
                          } finally { setLoading(false); }
                        }}
                      />
                      <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                    </button>
                  </div>
                </div>
             </div>
          </section>

          <section className="vision-window p-8 bg-card border-border/40 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5 text-brand" />
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">DATOS DE CONTACTO</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-5">
                  <div className="group">
                    <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">WHATSAPP DE ATENCIÓN</label>
                    <input 
                      type="text" 
                      value={formData.whatsapp_number}
                      onChange={e => setFormData({...formData, whatsapp_number: e.target.value})}
                      placeholder="593XXXXXXXXX"
                      className="w-full bg-background border border-border/60 p-4 rounded-2xl text-sm font-bold text-foreground focus:border-brand outline-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">CORREO ELECTRÓNICO</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-4 h-4 text-muted-foreground/40" />
                      <input 
                        type="email" 
                        value={formData.linked_email}
                        onChange={e => setFormData({...formData, linked_email: e.target.value})}
                        className="w-full bg-background border border-border/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold text-foreground focus:border-brand outline-none"
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-5">
                  <div className="group">
                    <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">DIRECCIÓN / SEDE</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground/40" />
                      <input 
                        type="text" 
                        value={formData.vcard_address}
                        onChange={e => setFormData({...formData, vcard_address: e.target.value})}
                        className="w-full bg-background border border-border/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold text-foreground focus:border-brand outline-none"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">CARGO (Ej: Gerente, Secretaria)</label>
                    <input 
                      type="text" 
                      value={formData.vcard_title}
                      onChange={e => setFormData({...formData, vcard_title: e.target.value})}
                      placeholder="Gerente, Director, etc."
                      className="w-full bg-background border border-border/60 p-4 rounded-2xl text-sm font-bold text-foreground focus:border-brand outline-none"
                    />
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-bottom-4 shadow-2xl
          ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
        </div>
      )}

    </div>
  );
}
