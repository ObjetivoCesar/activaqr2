import { supabase } from '@/lib/supabase';
import type { Tenant, Report } from '@/lib/types';
import { getSessionTenantId, getUnitsByTenant, getReportsByTenant, getTenantConfig } from '@/lib/dal';
import { auth } from '@/auth';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Eye, 
  FileText, 
  Zap,
  ChevronRight,
  User,
  MoreVertical,
  Bell,
  ChevronLeft,
  Filter,
  Car,
  ChevronDown,
  Settings as SettingsIcon,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';
import ReportStatusAction from '@/components/ReportStatusAction';
import UnitFilter from './UnitFilter';
import ActionWrapper from './ActionWrapper';
import DashboardTabs from './DashboardTabs';
import SettingsView from './SettingsView';
import FleetManager from './FleetManager';
import RealtimeNotificationHandler from './RealtimeNotificationHandler';
import { ThemeToggle } from '@/components/ThemeToggle';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '37, 99, 235';
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; unitId?: string; tenantId?: string }>;
}) {
  const params = await searchParams;
  const currentTab = params.tab || 'nuevos';
  const currentPage = parseInt(params.page || '1');
  const selectedUnitId = params.unitId;
  const itemsPerPage = 10;
  
  const tenantId = await getSessionTenantId();
  const { data: tenant } = await getTenantConfig(tenantId);
  
  const brandColor = tenant?.brand_color || '#2563eb';
  const logoUrl = tenant?.logo_url;
  const tenantName = tenant?.name || 'Command Center';

  // 1. Obtener Unidades filtradas
  const { data: units } = await getUnitsByTenant(tenantId);

  // 2. Obtener Estadísticas (filtradas por tenant)
  const { data: allReports } = await supabase
    .from('activaqr2_reports')
    .select('type, status, is_urgent')
    .eq('tenant_id', tenantId);

  const stats = {
    total: allReports?.length || 0,
    quejas: allReports?.filter((r: any) => r.type === 'queja' && r.is_urgent).length || 0,
    sugerencias: allReports?.filter((r: any) => r.type === 'sugerencia').length || 0,
    felicitaciones: allReports?.filter((r: any) => r.type === 'felicitacion').length || 0,
  };

  // 3. Consulta principal filtrada
  let reportsList: Report[] = [];
  let totalItems = 0;
  let totalPages = 0;

  if (currentTab !== 'config') {
    const isUrgent = currentTab === 'criticos' ? true : undefined;
    const status = currentTab === 'resueltos' ? 'Revisado' : 'Nuevo';

    const { data: reports, count } = await getReportsByTenant(tenantId, {
      status,
      is_urgent: isUrgent,
      page: currentPage,
      pageSize: itemsPerPage
    });

    reportsList = (reports as unknown as Report[]) || [];
    totalItems = count || 0;
    totalPages = Math.ceil(totalItems / itemsPerPage);
  }

  return (
    <div className="min-h-screen font-sans bg-background text-foreground pb-20 relative spatial-bg-mesh overflow-x-hidden">
      {tenantId && <RealtimeNotificationHandler tenantId={tenantId} />}
      
      <style>{`
        :root {
          --brand-primary: ${brandColor};
          --brand-primary-rgb: ${hexToRgb(brandColor)};
        }
        .text-brand { color: var(--brand-primary); }
        .bg-brand { background-color: var(--brand-primary); }
        .border-brand { border-color: var(--brand-primary); }
        .ring-brand { --tw-ring-color: var(--brand-primary); }
      `}</style>
      
      {/* Floating Spatial Navbar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-7xl px-4 md:px-6">
        <nav className="vision-pill px-6 md:px-8 py-3 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                {logoUrl ? (
                  <img src={logoUrl} alt={tenantName} className="w-full h-full object-contain" />
                ) : (
                  <Activity className="text-brand w-6 h-6" />
                )}
             </div>
             <div>
               <h1 className="text-sm md:text-base font-black tracking-tight text-white leading-none uppercase">{tenantName}</h1>
               <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-[8px] md:text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">Command Center</span>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-5 py-2 text-[10px] font-black bg-white/10 text-white rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-sm relative group cursor-pointer">
              <Bell className="w-4 h-4 text-white hover:text-brand transition-colors" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse"></div>
            </div>
            <Link 
              href={`/?tenantId=${(tenant as Tenant)?.id}&unitId=${units?.[0]?.id}`} 
              className="px-4 py-2 text-[10px] font-black text-white/70 hover:text-white transition-colors uppercase tracking-widest hidden md:block"
            >
              Simulador
            </Link>
            <div className="px-5 py-2 text-[10px] font-black bg-white/10 text-foreground rounded-full uppercase tracking-widest border border-border/40 backdrop-blur-sm">
              Admin Mode
            </div>
            <ThemeToggle />
          </div>
        </nav>
        {/* Sonido de Notificación (Oculto) */}
        <audio id="notif-sound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-32 relative z-10 transition-all duration-700 ease-in-out">
        
        {/* Main Central Window */}
        <div className="vision-window p-6 md:p-10 shadow-2xl overflow-hidden mb-10">
          
          {/* SaaS Usage Alerts */}
          {((units?.length || 0) >= (tenant?.max_units || 0) || tenant?.subscription_status !== 'active') && (
            <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${(units?.length || 0) >= (tenant?.max_units || 0) ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {(units?.length || 0) >= (tenant?.max_units || 0) 
                      ? 'Límite de unidades alcanzado' 
                      : 'Atención con tu suscripción'}
                  </p>
                  <p className="text-xs text-white/40">
                    {(units?.length || 0) >= (tenant?.max_units || 0)
                      ? `Has usado ${units?.length} de ${tenant?.max_units} unidades. Contacta a ActivaQR para ampliar tu plan.`
                      : `Tu estado actual es: ${tenant?.subscription_status}. Revisa tus facturas.`}
                  </p>
                </div>
              </div>
              <Link 
                href="https://wa.me/593999999999" 
                target="_blank"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                Hablar con Soporte
              </Link>
            </div>
          )}

          {/* Header Stats Inline */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground leading-none tracking-tighter flex items-center gap-3">
                Overview <Zap className="text-brand fill-current w-8 h-8" />
              </h2>
              <p className="text-foreground/50 dark:text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-3 italic">Live Fleet Intelligence & Safety Protocol</p>
            </div>

            <div className="grid grid-cols-2 lg:flex items-center gap-4 w-full md:w-auto">
               {[
                 { label: 'Total', val: stats.total, color: 'text-foreground' },
                 { label: 'Críticos', val: stats.quejas, color: 'text-orange-500' },
                 { label: 'Felicitaciones', val: stats.felicitaciones, color: 'text-emerald-500' },
                 { label: 'Ideas', val: stats.sugerencias, color: 'text-blue-500' },
               ].map((s, i) => (
                 <div key={i} className="vision-pill px-6 py-3 min-w-[120px] text-center border-border/60 dark:border-white/10 bg-card/40 shadow-sm">
                    <p className="text-[8px] font-black text-foreground/50 dark:text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Announcements / Public Notice */}
          <div className="mb-12 p-6 md:p-8 rounded-[2.5rem] bg-white/[0.03] dark:bg-black/[0.2] border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-3xl relative overflow-hidden group transition-all hover:bg-white/[0.05] dark:hover:bg-black/40">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <Megaphone className="w-32 h-32 rotate-12 text-brand/20 fill-current" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="px-3 py-1 rounded-full bg-foreground/5 text-foreground/60 text-[9px] font-black uppercase tracking-[0.2em] border border-foreground/10">Comunicado Oficial</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter mb-3">
                Proyecto Escuela Interesante 2029-30
              </h3>
              <p className="text-muted-foreground/80 text-sm md:text-base max-w-3xl leading-relaxed font-medium">
                Iniciamos la fase de planificación estratégica para el ciclo 2029-30. Nuestra plataforma se integrará con nuevos protocolos de seguridad inteligente para maximizar la eficiencia operativa de tu flota.
              </p>
              <div className="mt-6 flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-border/40" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">ActivaQR Intelligence Protocol</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-8 border-b border-border/40 mt-8">
              <div className="flex items-center gap-4">
                {/* Filtro de Unidad */}
                <div className="flex items-center gap-3">
                  <UnitFilter units={units} selectedUnitId={selectedUnitId} brandColor={brandColor} />
                </div>
              </div>
              
              {/* Tabs Responsivos al estilo Vision */}
              <div className="w-full xl:w-auto flex items-center gap-2">
                <DashboardTabs 
                  tabs={[
                    { id: 'criticos', label: '🚨 Críticos' },
                    { id: 'nuevos', label: '📥 Inbox' },
                    { id: 'flota', label: '🚐 Flota' },
                    { id: 'resueltos', label: '✅ Archivados' },
                    { id: 'config', label: '⚙️ Settings' },
                  ]}
                  currentTab={currentTab}
                  brandColor={brandColor}
                />
              </div>
            </div>

            {/* Renderizado Condicional */}
            {currentTab === 'config' ? (
              <SettingsView tenant={tenant} brandColor={brandColor} />
            ) : currentTab === 'flota' ? (
              <FleetManager units={units || []} tenantId={(tenant as Tenant)?.id} maxUnits={tenant?.max_units} brandColor={brandColor} />
            ) : (
              <div className="space-y-4">
                {reportsList.length === 0 ? (
                  <div className="vision-card p-20 text-center bg-card border-border/40">
                     <p className="text-muted-foreground/40 font-black uppercase tracking-[0.3em] text-[10px] italic">Queue Empty</p>
                  </div>
                ) : (
                  reportsList.map((rep) => (
                    <details key={rep.id} className="group vision-card overflow-hidden transition-all duration-500 open:ring-1 open:ring-brand/30 bg-card border-border/40 shadow-sm">
                      <summary className="p-4 md:p-6 flex items-center gap-4 cursor-pointer list-none hover:bg-accent/50 transition-colors select-none text-foreground">
                        
                        <div className="w-12 h-12 shrink-0 vision-pill flex flex-col items-center justify-center text-foreground border-border/40 bg-background/50">
                          <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">UNIT</span>
                          <span className="text-lg font-black tracking-tighter italic leading-none">{rep.activaqr2_units?.unit_code}</span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                           <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                                ${rep.type === 'queja' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30' : 
                                  rep.type === 'felicitacion' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 
                                  'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'}`}
                              >
                                {rep.type}
                              </span>
                              {rep.rating && (
                                <span className="flex text-yellow-500 text-[10px]">
                                   {'★'.repeat(rep.rating)}{'☆'.repeat(5-rep.rating)}
                                </span>
                              )}
                              <span className="text-foreground/20 dark:text-white/10 text-xs hidden md:block">|</span>
                              <span className="text-[10px] font-bold text-foreground/60 dark:text-white/40 uppercase tracking-widest italic leading-none">ID: {rep.ticket_number}</span>
                           </div>
                           <p className="text-sm md:text-base font-bold text-foreground truncate pr-8 tracking-tight">{rep.description}</p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                           <div className="hidden sm:flex flex-col items-end">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Received</p>
                              <p className="text-xs font-black text-foreground italic">{new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="p-2 rounded-full group-hover:bg-accent transition-colors">
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform duration-300" />
                           </div>
                        </div>
                      </summary>
                      
                      <div className="px-6 pb-8 pt-4 border-t border-white/5 animate-in fade-in zoom-in-95 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           
                           {/* Detalles del Reporte */}
                           <div className="space-y-8">
                              <div>
                                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-brand" /> Content Overview
                                 </h4>
                                 <p className="text-base text-foreground bg-accent/50 p-6 rounded-3xl border border-border/40 leading-relaxed font-medium tracking-tight">
                                    {rep.description}
                                 </p>
                              </div>

                              {rep.media_url && (
                                 <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                       <Eye className="w-3 h-3 text-brand" /> Evidence Attachment
                                    </h4>
                                    <div className="relative group/media overflow-hidden rounded-3xl border border-border/40 shadow-2xl bg-background/50">
                                       {rep.media_type === 'video' ? (
                                         <video src={rep.media_url} controls className="w-full aspect-video object-cover" />
                                       ) : (
                                         <img src={rep.media_url} alt="Evidencia" className="w-full h-auto object-contain max-h-[500px]" />
                                       )}
                                       <div className="absolute top-4 right-4 p-3 vision-pill text-foreground opacity-0 group-hover/media:opacity-100 transition-all duration-300 backdrop-blur-xl">
                                          <Link href={rep.media_url} target="_blank" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                             Original <Eye className="w-3 h-3" />
                                          </Link>
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>

                           {/* Consola de Acción */}
                           <div className="flex flex-col gap-6">
                               <div className="vision-card p-6 space-y-6 shadow-md border-border/40 bg-card/60">
                                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                     <Zap className="w-3 h-3 text-brand" /> Consola de Operaciones
                                  </h4>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 bg-background/50 rounded-2xl border border-border/40">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Placa</p>
                                        <p className="text-sm font-black italic text-foreground tracking-tighter">{rep.activaqr2_units?.plate}</p>
                                     </div>
                                     <div className="p-4 bg-background/50 rounded-2xl border border-border/40">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Propietario</p>
                                        <p className="text-sm font-black italic text-foreground truncate">{rep.activaqr2_units?.activaqr2_tenants?.name}</p>
                                     </div>
                                  </div>

                                  <div className="pt-2 flex flex-col gap-3">
                                     <ReportStatusAction 
                                        reportId={rep.id} 
                                        currentStatus={rep.status} 
                                        brandColor={brandColor}
                                     />
                                    <Link 
                                      href={`/report/${rep.id}`} 
                                      target="_blank"
                                      className="vision-pill w-full py-4 bg-accent text-foreground text-center text-[10px] font-black uppercase tracking-widest hover:bg-accent/80 shadow-md border border-border/40 block"
                                    >
                                      📄 Generar Boleta (PDF)
                                    </Link>
                                 </div>
                              </div>

                              <div className={`p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between border
                                 ${rep.is_urgent ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-accent/50 border-border/40 text-muted-foreground'}`}
                              >
                                 <div className="pl-2">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Priority Level</p>
                                    <p className="text-sm font-black tracking-tight flex items-center gap-3">
                                       {rep.is_urgent ? (
                                         <><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> CRITICAL TASK</>
                                       ) : (
                                         <><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> STANDARD PENDING</>
                                       )}
                                    </p>
                                 </div>
                                 <div className="p-4 vision-pill border-white/10 bg-white/5">
                                    <Bell className={`w-6 h-6 ${rep.is_urgent ? 'text-red-400' : 'text-white/20'}`} />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </details>
                  ))
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-3">
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Link 
                          key={p} 
                          href={`?tab=${currentTab}&page=${p}${selectedUnitId ? `&unitId=${selectedUnitId}` : ''}`}
                          className={`w-12 h-12 vision-pill flex items-center justify-center font-black text-[10px] transition-all duration-300
                            ${currentPage === p ? 'bg-foreground text-background shadow-[0_0_30px_rgba(var(--foreground-rgb),0.3)] scale-110' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/10'}`}
                        >
                           {p}
                        </Link>
                     ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Bar (Mobile Only Style Refined) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden z-[100] w-[calc(100%-2rem)] max-w-sm">
         <div className="vision-pill p-3 flex justify-between items-center shadow-3xl bg-background/60 border-border/50 backdrop-blur-3xl">
            <div className="flex -space-x-3 pl-2">
               {[1,2,3].map(i => <div key={i} className="w-9 h-9 rounded-full border-2 border-background/40 bg-muted shadow-xl overflow-hidden shadow-black/50"></div>)}
               <div className="w-9 h-9 rounded-full border-2 border-background/40 bg-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-950">12</div>
            </div>
            <button className="bg-foreground text-background px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
               Monitor Active
            </button>
         </div>
      </div>
    </div>
  );
}
