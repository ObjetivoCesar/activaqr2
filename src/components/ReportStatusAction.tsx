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
  const [isPending, startTransition] = useTransition();

  function handleUpdateStatus() {
    if (currentStatus !== 'Nuevo' || done) return;

    startTransition(async () => {
      try {
        await updateReportStatus(reportId);
        setDone(true);
      } catch (err) {
        console.error('Error updating status:', err);
        alert('Error al actualizar el reporte. Intenta de nuevo.');
      }
    });
  }

  if (currentStatus !== 'Nuevo' || done) {
    return (
      <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-sm transition-all duration-300">
        <Check className="w-3.5 h-3.5" />
        <span className="tracking-[0.1em]">GESTIONADO</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleUpdateStatus}
      disabled={isPending}
      className="glass-panel hover:bg-white/90 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 group hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      style={{ color: brandColor }}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          <span className="tracking-[0.1em]">GESTIONAR</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}
