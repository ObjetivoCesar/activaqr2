'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

import { sendWhatsAppMessage } from '@/lib/evolution';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateReportStatus(reportId: string) {
  // Primero obtenemos el ticket_number para la notificación
  const { data: reportData } = await supabase
    .from('activaqr2_reports')
    .select('ticket_number')
    .eq('id', reportId)
    .single();

  const { error } = await supabase
    .from('activaqr2_reports')
    .update({ status: 'Revisado' })
    .eq('id', reportId);

  if (error) {
    throw new Error(`Error actualizando reporte: ${error.message}`);
  }

  // Notificar al socio (número de prueba proporcionado)
  if (reportData?.ticket_number) {
    try {
      const msg = `🔔 *Notificación ActivaQR*\n\nEl reporte *${reportData.ticket_number}* ha sido GESTIONADO por la central.\n\n_Este es un mensaje automático del sistema de vigilancia._`;
      await sendWhatsAppMessage('593963410409', msg);
    } catch (sendErr) {
      console.error('Error enviando notificación WhatsApp:', sendErr);
      // No lanzamos error para no bloquear la UI si falla Whatsapp
    }
  }

  // Invalida la caché del dashboard para que los datos se refresquen
  revalidatePath('/dashboard');
}
