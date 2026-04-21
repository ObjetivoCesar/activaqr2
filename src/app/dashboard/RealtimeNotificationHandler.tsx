'use client';

import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RealtimeNotificationHandler({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabaseClient
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activaqr2_reports',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload: any) => {
          console.log('¡Nuevo reporte recibido!', payload);
          const audio = document.getElementById('notif-sound') as HTMLAudioElement;
          if (audio) {
            audio.play().catch(e => console.log('Audio play failed:', e));
          }
          // Refrescar para ver el nuevo reporte
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [tenantId, router]);

  return null;
}
