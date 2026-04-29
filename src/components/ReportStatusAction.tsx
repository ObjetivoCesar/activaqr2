'use client';

import { useState, useTransition } from 'react';
import { ChevronRight, Loader2, Check } from 'lucide-react';
import { updateReportStatus } from '@/app/actions/report-actions';

interface ReportStatusActionProps {
  reportId: string;
  currentStatus: string;
  brandColor?: string;
}

export default function ReportStatusAction({ reportId, currentStatus, brandColor = '#2563eb' }: ReportStatusActionProps) {
  const [done, setDone] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUpdateStatus() {
    if (currentStatus !== 'Nuevo' || done) return;

    startTransition(async () => {
      try {
        await updateReportStatus(reportId, resolutionNote);
        setDone(true);
        setShowForm(false);
      } catch (err) {
        console.error('Error updating status:', err);
        alert('Error al actualizar el reporte. Intenta de nuevo.');
      }
    });
  }

  if (currentStatus !== 'Nuevo' || done) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-sm transition-all duration-300">
          <Check className="w-3.5 h-3.5" />
          <span className="tracking-[0.1em]">CASO RESUELTO Y ARCHIVADO</span>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="glass-panel hover:bg-white/90 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 group hover:shadow-lg transition-all duration-300"
        style={{ color: brandColor }}
      >
        <span className="tracking-[0.1em]">TOMAR ACCIÓN</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-md animate-in slide-in-from-top-2 duration-300">
      <div className="relative group">
        <label className="absolute -top-2.5 left-4 px-1.5 bg-background text-[8px] font-black text-muted-foreground uppercase tracking-widest z-10">DETALLES DE LA RESOLUCIÓN</label>
        <textarea 
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          placeholder="Describe la acción tomada (ej: Se amonestó al conductor)"
          className="w-full bg-background/50 border border-border/60 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-brand transition-all resize-none"
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleUpdateStatus}
          disabled={isPending || !resolutionNote.trim()}
          className="flex-1 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          CERRAR Y NOTIFICAR
        </button>
        <button
          onClick={() => setShowForm(false)}
          disabled={isPending}
          className="px-4 py-3 border border-border/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-foreground/5 transition-all"
        >
          CANCELAR
        </button>
      </div>
    </div>
  );
}
