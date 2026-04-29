'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Send, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { sendBroadcastMessage } from '@/app/actions/tenant-actions';
import { useSession } from "next-auth/react";

export default function ComunicadosPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setStatus(null);

    try {
      const tId = (session?.user as any)?.tenantId;

      if (!tId) throw new Error("No se pudo identificar la empresa.");

      const result = await sendBroadcastMessage(tId, message);
      
      if (result.success) {
        setStatus({ 
          type: 'success', 
          text: `Mensaje enviado con éxito a ${result.count} de ${result.total} socios.` 
        });
        setMessage('');
      } else {
        throw new Error(result.error as string);
      }
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Error al enviar el mensaje.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 spatial-bg-mesh">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-all border border-border/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Broadcasting System</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="vision-window p-8 md:p-12 space-y-10 shadow-2xl bg-card/40 border-border/40">
          <div className="text-center space-y-4">
             <div className="w-20 h-20 rounded-[2rem] bg-brand/10 text-brand flex items-center justify-center mx-auto border border-brand/20 shadow-xl shadow-brand/10">
                <Megaphone className="w-10 h-10 fill-current" />
             </div>
             <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">COMUNICADO A SOCIOS</h1>
             <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] max-w-md mx-auto">
                Redacta un mensaje que llegará instantáneamente a todos los WhatsApps registrados en tu flota.
             </p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-3 left-6 px-2 bg-background text-[9px] font-black text-brand uppercase tracking-widest z-10">MENSAJE PARA LA FLOTA</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej: Mañana hay asamblea general a las 10:00 AM en la sede central. Asistencia obligatoria."
                rows={6}
                className="w-full bg-background/50 border border-border/60 rounded-[2.5rem] p-8 text-lg font-medium text-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all shadow-inner resize-none leading-relaxed"
              />
            </div>

            {status && (
              <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-bottom-4
                ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Megaphone className="w-6 h-6 rotate-180" />}
                <span className="text-xs font-black uppercase tracking-widest">{status.text}</span>
              </div>
            )}

            <button 
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="w-full py-6 bg-foreground text-background rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ENVIANDO COMUNICADO...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  PUBLICAR Y NOTIFICAR A TODOS
                </>
              )}
            </button>
          </div>

          <div className="pt-6 border-t border-border/20">
             <div className="flex items-center justify-center gap-3 text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.3em]">
                <div className="h-[1px] w-12 bg-border/40" />
                Powered by ActivaQR Evolution
                <div className="h-[1px] w-12 bg-border/40" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
