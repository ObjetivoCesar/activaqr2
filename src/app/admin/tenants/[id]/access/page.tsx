import { supabase } from '@/lib/supabase';
import { KeyRound, Mail, Building, ChevronLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setTenantAccess } from './actions';

export default async function TenantAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Obtener datos del tenant
  const { data: tenant } = await supabase
    .from('activaqr2_tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (!tenant) {
    notFound();
  }

  const setAccessWithId = setTenantAccess.bind(null, id);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 font-[family-name:var(--font-geist-sans)] spatial-bg-mesh">
      <div className="max-w-xl mx-auto">
        <Link 
          href="/admin"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Command Center
        </Link>

        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-border/40">
          <div className="p-8 border-b border-border/40 bg-card/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <KeyRound size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestionar Acceso</h1>
                <p className="text-muted-foreground text-sm">Configura las credenciales para el cliente</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-2xl border border-border/40">
              <div className="flex items-center gap-3 text-sm">
                <Building size={16} className="text-muted-foreground" />
                <span className="font-bold uppercase tracking-tight">{tenant.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">{tenant.linked_email || 'Sin email vinculado'}</span>
              </div>
            </div>
          </div>

          <form action={setAccessWithId} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Nueva Contraseña
              </label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-muted/50 border border-border/60 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                />
              </div>
              <p className="text-[10px] text-muted-foreground ml-1 italic">
                * Esto actualizará el acceso en Supabase Auth y enviará un email al cliente.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} />
              Activar / Resetear Acceso
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
