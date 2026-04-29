'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

import { sendWhatsAppMessage } from '@/lib/evolution';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateReportStatus(reportId: string, resolutionNote?: string) {
  // Primero obtenemos el ticket_number y metadata para no perder datos previos
  const { data: reportData } = await supabase
    .from('activaqr2_reports')
    .select('ticket_number, metadata')
    .eq('id', reportId)
    .single();

  const newMetadata = {
    ...(reportData?.metadata || {}),
    resolution_text: resolutionNote || 'Caso gestionado por la central.'
  };

  const { error } = await supabase
    .from('activaqr2_reports')
    .update({ 
      status: 'Revisado',
      resolved_at: new Date().toISOString(),
      metadata: newMetadata
    })
    .eq('id', reportId);

  if (error) {
    throw new Error(`Error actualizando reporte: ${error.message}`);
  }

  // Notificar al socio (número de prueba proporcionado)
  if (reportData?.ticket_number) {
    try {
      const msg = `✅ *Caso Resuelto: ${reportData.ticket_number}*\n\nLa administración ha marcado este caso como GESTIONADO.\n\n*Resolución:* _"${resolutionNote || 'Sin observaciones'}"_\n\n_Este es un mensaje automático del sistema de control._`;
      await sendWhatsAppMessage('593963410409', msg);
    } catch (sendErr) {
      console.error('Error enviando notificación WhatsApp:', sendErr);
    }
  }

  revalidatePath('/dashboard');
}
