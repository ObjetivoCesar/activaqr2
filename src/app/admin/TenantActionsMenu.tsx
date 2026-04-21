'use client';

import { useState } from 'react';
import { EllipsisVertical, Save, X } from 'lucide-react';
import { updateTenant } from './actions';
import type { Tenant } from '@/lib/types';

export default function TenantActionsMenu({ tenant }: { tenant: Tenant }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateTenant(tenant.id, formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert('Error updating tenant');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-primary/10 rounded-lg transition-all text-muted-foreground hover:text-primary flex items-center justify-center group/btn"
        title="Editar Cliente"
      >
        <EllipsisVertical size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold text-foreground">Editar {tenant.name}</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-muted-foreground hover:text-foreground bg-background/50 hover:bg-accent rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id={`edit-form-${tenant.id}`} onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre Comercial</label>
                  <input name="name" type="text" defaultValue={tenant.name} required className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan de Suscripción</label>
                  <select name="plan" defaultValue={tenant.plan} className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground appearance-none">
                    <option value="solo">ActivaQR Solo (1 Unidad)</option>
                    <option value="empresa_10">ActivaQR Flota 10 (Hasta 10 Unidades)</option>
                    <option value="empresa_50">ActivaQR Flota 50 (Hasta 50 Unidades)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</label>
                    <select name="subscription_status" defaultValue={tenant.subscription_status} className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground appearance-none">
                      <option value="active">Activo</option>
                      <option value="trial">Prueba (Trial)</option>
                      <option value="suspended">Suspendido</option>
                      <option value="expired">Expirado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Precio Mensual ($)</label>
                    <input name="price" type="number" step="0.01" defaultValue={tenant.monthly_price} required className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp de Soporte</label>
                  <input name="whatsapp" type="text" defaultValue={tenant.whatsapp_number || ''} placeholder="+593..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border/40 bg-muted/30 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form={`edit-form-${tenant.id}`}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Save size={18} />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
