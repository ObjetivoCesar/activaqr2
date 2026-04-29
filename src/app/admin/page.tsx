import { supabase } from '@/lib/supabase';
import { 
  Users, 
  DollarSign, 
  Layout, 
  Plus, 
  CheckCircle2,
  MoreVertical,
  Activity,
  LogOut,
  KeyRound
} from 'lucide-react';
import Link from 'next/link';
import { Tenant } from '@/lib/types';
import { ThemeToggle } from '@/components/ThemeToggle';
import { logout } from '@/app/login/actions';
import TenantActionsMenu from './TenantActionsMenu';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 1. Fetch data for metrics and table
  const { data: tenants } = await supabase
    .from('activaqr2_tenants')
    .select('*')
    .order('created_at', { ascending: false });

  const totalTenants = tenants?.length || 0;
  const activeTenants = tenants?.filter((t: Tenant) => t.subscription_status === 'active').length || 0;
  const mrr = tenants?.reduce((acc: number, t: Tenant) => acc + (t.monthly_price || 0), 0) || 0;
  
  // 2. Fetch units total
  const { count: totalUnits } = await supabase
    .from('activaqr2_units')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 spatial-bg-mesh">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Super Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            SaaS Command Center
          </h1>
          <p className="text-muted-foreground mt-1">Gestión global de ActivaQR2</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all text-sm font-medium"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              Salir
            </button>
          </form>
          <Link 
            href="/admin/tenants/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus size={20} />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Metric Cards - Spatial Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="MRR Total" 
            value={`$${mrr.toLocaleString()}`} 
            icon={<DollarSign className="text-emerald-400" />}
            trend="+12%"
          />
          <MetricCard 
            title="Empresas" 
            value={totalTenants.toString()} 
            icon={<Users className="text-blue-400" />}
          />
          <MetricCard 
            title="Suscripciones Activas" 
            value={activeTenants.toString()} 
            icon={<CheckCircle2 className="text-emerald-400" />}
          />
          <MetricCard 
            title="Unidades Totales" 
            value={(totalUnits || 0).toString()} 
            icon={<Activity className="text-purple-400" />}
          />
        </div>

        {/* Tenants Table - Glassmorphism Container */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-border/40 flex items-center justify-between bg-card/50">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <Layout size={18} className="text-muted-foreground" />
              Gestión de Clientes
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted-foreground text-[10px] uppercase tracking-widest border-b border-border/40 bg-muted/30">
                  <th className="px-6 py-4 font-black">Empresa</th>
                  <th className="px-6 py-4 font-black">Plan</th>
                  <th className="px-6 py-4 font-black">Estado</th>
                  <th className="px-6 py-4 font-black">Cuota Mensual</th>
                  <th className="px-6 py-4 font-black">Vencimiento</th>
                  <th className="px-6 py-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {tenants?.map((tenant: Tenant) => (
                  <tr key={tenant.id} className="hover:bg-accent/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          {tenant.logo_url ? (
                            <img src={tenant.logo_url} alt="" className="w-6 h-6 object-contain" />
                          ) : (
                            tenant.name[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold group-hover:text-primary transition-colors uppercase tracking-tight text-foreground">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.linked_email || 'Sin email vinculado'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        tenant.plan === 'empresa_50' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : tenant.plan === 'empresa_10'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {tenant.plan.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          tenant.subscription_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-semibold capitalize text-foreground">{tenant.subscription_status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm font-bold text-foreground">
                        ${tenant.monthly_price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {tenant.subscription_end ? new Date(tenant.subscription_end).toLocaleDateString() : 'Indefinido'}
                    </td>
                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/tenants/${tenant.id}/access`}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-all text-muted-foreground hover:text-primary flex items-center justify-center group/btn"
                        title="Gestionar Acceso"
                      >
                        <KeyRound size={18} />
                      </Link>
                      <TenantActionsMenu tenant={tenant} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl group hover:border-border/60 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-muted border border-border group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold mt-1 tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}
