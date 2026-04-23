import { supabase } from '@/lib/supabase';
import type { Report } from '@/lib/types';
import { MapPin, Clock, Car, User, Ticket } from 'lucide-react';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: report } = await supabase
    .from('activaqr2_reports')
    .select('*, activaqr2_units(*, activaqr2_tenants(*))')
    .eq('id', id)
    .single();

  if (!report) notFound();

  const r = report as Report;
  const tenant = r.activaqr2_units?.activaqr2_tenants;

  return (
    <div className="bg-white min-h-screen p-10 text-black font-sans">
      <style>{`
        @media print {
          .no-print { display: none; }
          body { padding: 0; background: white; }
          .print-container { border: none; shadow: none; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto border-2 border-zinc-100 p-12 rounded-3xl shadow-sm print-container">
        {/* Header con Logo */}
        <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-10 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Informe de Incidencia</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Certificado por ActivaQR - Protocolo de Seguridad</p>
          </div>
          <div className="text-right">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt="Logo" className="h-16 w-auto object-contain ml-auto" />
            ) : (
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center font-black">AQ</div>
            )}
            <p className="mt-2 font-black text-sm uppercase">{tenant?.name}</p>
          </div>
        </div>

        {/* Info Principal */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ticket ID</p>
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-black tracking-tight">#{r.ticket_number}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Fecha y Hora</p>
              <div className="flex items-center gap-2 font-bold">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{new Date(r.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estado</p>
              <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-black uppercase">{r.status}</span>
            </div>
          </div>

          <div className="space-y-6 bg-zinc-50 p-8 rounded-3xl">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Unidad</p>
              <div className="flex items-center gap-2 font-black text-lg">
                <Car className="w-5 h-5" />
                <span>{r.activaqr2_units?.unit_code} - {r.activaqr2_units?.plate}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Responsable (Chofer)</p>
              <div className="flex items-center gap-2 font-bold">
                <User className="w-4 h-4 text-zinc-400" />
                <span>{r.activaqr2_units?.driver_name || 'No asignado'}</span>
              </div>
            </div>
             {r.rating && (
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Calificación Usuario</p>
                <div className="flex gap-1 text-yellow-500">
                  {'⭐'.repeat(r.rating)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detalle */}
        <div className="mb-12">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 border-b-2 border-zinc-50 pb-2">Descripción de los Hechos</h3>
          <p className="text-lg leading-relaxed text-zinc-800 whitespace-pre-wrap">
            {r.description || 'Sin descripción detallada.'}
          </p>
        </div>

        {/* Evidencia y Ubicación */}
        <div className="grid grid-cols-2 gap-12 mb-12">
           {r.location_lat && (
             <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Punto Geográfico</h3>
               <div className="p-4 border-2 border-zinc-50 rounded-2xl flex items-center gap-4">
                  <MapPin className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-xs font-bold">{r.location_lat}, {r.location_lng}</p>
                    <a 
                      href={`https://www.google.com/maps?q=${r.location_lat},${r.location_lng}`}
                      target="_blank"
                      className="text-[10px] text-blue-500 font-bold uppercase underline"
                    > Ver en Maps</a>
                  </div>
               </div>
             </div>
           )}
           {r.media_url && (
             <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Evidencia Adjunta</h3>
               <div className="rounded-2xl border-2 border-zinc-50 overflow-hidden">
                  {r.media_type === 'video' ? (
                     <p className="p-4 text-xs italic text-zinc-400">Evidencia de video disponible online.</p>
                  ) : (
                    <img src={r.media_url} alt="Evidencia" className="w-full h-auto" />
                  )}
               </div>
             </div>
           )}
        </div>

        {/* Footer legal */}
        <div className="pt-10 border-t-2 border-zinc-100 text-center space-y-4">
           <p className="text-[10px] text-zinc-400 font-medium max-w-xl mx-auto uppercase tracking-widest leading-loose">
             Este documento ha sido generado automáticamente por el sistema ActivaQR. La validez de este informe está sujeta a las grabaciones internas de la unidad y revisiones administrativas.
           </p>
           <div className="no-print">
              <PrintButton />
           </div>
        </div>
      </div>
    </div>
  );
}
