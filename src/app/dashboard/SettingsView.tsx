'use client';

import { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  tenant: any;
  brandColor: string;
}

export default function SettingsView({ tenant, brandColor }: SettingsViewProps) {
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
      vcard_address: parsedVcard.address || ''
    };
  });

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
          address: formData.vcard_address
        })
      };

      const result = await updateTenantAction(tenant.id, payload);

      if (!result.success) {
        throw new Error(result.error);
      }
      
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
      
      // Dar tiempo para ver el mensaje antes de recargar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error saving settings:', err);
      setMessage({ type: 'error', text: 'Error al guardar: ' + (err.message || 'Error desconocido') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8 space-y-8 animate-in fade-in duration-500 rounded-3xl">
      
      <div className="flex items-center gap-3 border-b border-border/40 pb-6">
        <div className="p-3 rounded-2xl bg-brand/10 text-brand">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Configuración de Marca Blanca</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Personaliza la identidad y automatización de tu empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Columna 1: Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-foreground mb-2">
            <Palette className="w-4 h-4 text-brand" />
            <span className="text-xs font-black uppercase tracking-widest">Identidad Visual</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Nombre Comercial</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-background/50 border border-border/40 p-3 rounded-xl text-sm focus:ring-2 focus:ring-brand font-medium text-foreground outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Color Principal</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={formData.brand_color}
                    onChange={e => setFormData({...formData, brand_color: e.target.value})}
                    className="w-12 h-10 rounded-lg cursor-pointer bg-background border border-border/40 p-1"
                  />
                  <input 
                    type="text" 
                    value={formData.brand_color}
                    onChange={e => setFormData({...formData, brand_color: e.target.value})}
                    className="flex-1 bg-background/50 border border-border/40 px-3 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand text-foreground outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Nombre en VCard</label>
                <input 
                  type="text" 
                  value={formData.vcard_name}
                  onChange={e => setFormData({...formData, vcard_name: e.target.value})}
                  placeholder="Ej: Transportes ABC"
                  className="w-full nm-inset p-3 rounded-xl text-xs border-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Logo URL (Icono)</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={formData.logo_url}
                  onChange={e => setFormData({...formData, logo_url: e.target.value})}
                  className="flex-1 bg-background/50 border border-border/40 p-3 rounded-xl text-xs focus:ring-2 focus:ring-brand font-medium text-foreground outline-none"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-card hover:bg-accent transition-colors border border-border/40"
                >
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
                        const fileExt = file.name.split('.').pop();
                        const fileName = `logo-${tenant.id}-${Date.now()}.${fileExt}`;
                        const filePath = `logos/${fileName}`;

                        const { error: uploadError } = await supabaseClient.storage
                          .from('reports-media')
                          .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabaseClient.storage
                          .from('reports-media')
                          .getPublicUrl(filePath);

                        setFormData({...formData, logo_url: publicUrl});
                      } catch (err: any) {
                        alert("Error al subir logo: " + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-5 h-5 text-muted-foreground/40" />}
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground mt-2 ml-1 font-bold italic tracking-wider">Haz clic en el cuadro para subir un archivo local</p>
            </div>
          </div>
        </div>

        {/* Columna 2: Contacto y Automatización */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-zinc-900 mb-2">
            <Phone className="w-4 h-4 text-brand" />
            <span className="text-xs font-black uppercase tracking-widest">Contacto y CRM</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">WhatsApp Business (Con código país)</label>
              <input 
                type="text" 
                value={formData.whatsapp_number}
                onChange={e => setFormData({...formData, whatsapp_number: e.target.value})}
                placeholder="593XXXXXXXXX"
                className="w-full nm-inset p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Google Email (Sincronización)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="email" 
                  value={formData.linked_email}
                  onChange={e => setFormData({...formData, linked_email: e.target.value})}
                  placeholder="empresa@gmail.com"
                  className="w-full nm-inset pl-10 pr-3 py-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Nombre en Contacto (vCard)</label>
              <input 
                type="text" 
                value={formData.vcard_name}
                onChange={e => setFormData({...formData, vcard_name: e.target.value})}
                placeholder="Ej. Soporte Empresa"
                className="w-full nm-inset p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Cargo / Título (vCard)</label>
              <input 
                type="text" 
                value={formData.vcard_title}
                onChange={e => setFormData({...formData, vcard_title: e.target.value})}
                placeholder="Ej. Atención al Cliente"
                className="w-full nm-inset p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Sitio Web (vCard)</label>
              <input 
                type="url" 
                value={formData.vcard_website}
                onChange={e => setFormData({...formData, vcard_website: e.target.value})}
                placeholder="https://miempresa.com"
                className="w-full nm-inset p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Dirección Física (vCard)</label>
              <input 
                type="text" 
                value={formData.vcard_address}
                onChange={e => setFormData({...formData, vcard_address: e.target.value})}
                placeholder="Ej. Av. Principal 123"
                className="w-full nm-inset p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {/* Notificaciones removidas - Se manejan por unidad individual en la pestaña Flota */}
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-left-4
          ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-foreground text-background px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>

    </div>
  );
}
