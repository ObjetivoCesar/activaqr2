import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, sendWhatsAppDocument } from '@/lib/evolution';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      tenantId, unitId, type, content, isUrgent, mediaUrl, mediaType,
      rating, location_lat, location_lng 
    } = data;

    if (!tenantId || !unitId || !type) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // 1. Obtener datos de la unidad y del tenant para la notificación y PDF
    const { data: unit } = await supabase
      .from('activaqr2_units')
      .select('unit_code, plate, driver_name, notification_number')
      .eq('id', unitId)
      .single();

    const { data: tenant } = await supabase
      .from('activaqr2_tenants')
      .select('name, brand_color, notification_number')
      .eq('id', tenantId)
      .single();

    // 2. Query count of reports for the tenant
    const { count } = await supabase
      .from('activaqr2_reports')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const nextId = (count || 0) + 1;
    const ticketNumber = `TKT-${nextId.toString().padStart(5, '0')}`;

    const reportPayload = {
      tenant_id: tenantId,
      unit_id: unitId,
      source: 'web',
      type: type,
      description: content || '',
      is_urgent: isUrgent || false,
      status: 'Nuevo',
      ticket_number: ticketNumber,
      media_url: mediaUrl || null,
      media_type: mediaType || null,
      rating,
      location_lat,
      location_lng
    };

    // 3. Generar PDF de Reporte ANTES de insertar para guardar la URL
    let pdfUrl = '';
    try {
      const { generateReportPDF } = await import('@/lib/pdf-generator');
      pdfUrl = await generateReportPDF(reportPayload, unit || {}, tenant || {});
    } catch (pdfError) {
      console.error('Error generando PDF:', pdfError);
    }

    const { error } = await supabase.from('activaqr2_reports').insert({
      ...reportPayload,
      metadata: { pdf_url: pdfUrl }
    });

    if (error) {
      console.error('Error insertando reporte:', error);
      return NextResponse.json({ error: 'Fallo al guardar el reporte', details: error }, { status: 500 });
    }

    // 4. Notificación Instantánea vía WhatsApp (Multinivel)
    const notificationNumbers = [
      unit?.notification_number,
      tenant?.notification_number
    ].filter(Boolean) as string[];

    if (notificationNumbers.length > 0) {
      const typeLabels: Record<string, string> = {
        'felicitacion': 'FELICITACIÓN',
        'reporte': 'REPORTE DE NOVEDAD',
        'queja': 'EMERGENCIA / AUXILIO'
      };

      let emoji = '📝';
      if (type === 'queja') emoji = '🚨';
      if (type === 'felicitacion') emoji = '⭐';
      if (mediaType === 'audio') emoji = '🎙️';

      let message = `${emoji} *NUEVO REPORTE ACTIVAQR*\n\n`;
      message += `*Unidad:* ${unit?.unit_code || 'N/A'} (${unit?.plate || 'S/P'})\n`;
      message += `*Empresa:* ${tenant?.name || 'N/A'}\n`;
      message += `*Chofer:* ${unit?.driver_name || 'No asignado'}\n`;
      message += `*Tipo:* ${typeLabels[type] || type.toUpperCase()}\n`;
      if (rating) message += `*Calificación:* ${'⭐'.repeat(rating)}\n`;
      message += `*Detalle:* ${content || (mediaType === 'audio' ? 'Mensaje de voz enviado' : 'Sin descripción')}\n\n`;
      
      if (location_lat && location_lng) {
        message += `📍 *Ubicación:* https://www.google.com/maps?q=${location_lat},${location_lng}\n`;
      }
      
      if (mediaUrl) {
        const urls = mediaUrl.split(',');
        if (urls.length === 1) {
          const mediaEmoji = mediaType === 'audio' ? '🎙️' : (urls[0].includes('video') ? '🎥' : '📸');
          message += `${mediaEmoji} *Evidencia:* ${urls[0]}\n`;
        } else {
          message += `📸 *Evidencias Multimedia (${urls.length}):*\n`;
          urls.forEach((url: string, i: number) => {
            message += `• ${url.trim()}\n`;
          });
        }
      }

      message += `\n*Ticket:* #${ticketNumber}`;

      // Enviar mensaje de texto a todos los destinatarios
      for (const number of [...new Set(notificationNumbers)]) {
        try {
          await sendWhatsAppMessage(number, message);
        } catch (notifyError) {
          console.error(`Error enviando notificación WA a ${number}:`, notifyError);
        }
      }

      // Enviar PDF como archivo adjunto real
      if (pdfUrl) {
        for (const number of [...new Set(notificationNumbers)]) {
          try {
            await sendWhatsAppDocument(
              number, 
              pdfUrl, 
              `Reporte_${ticketNumber}.pdf`,
              `📄 Reporte formal ${ticketNumber} - ${(tenant?.name || 'ActivaQR').toUpperCase()}`
            );
          } catch (pdfNotifyError) {
            console.error(`Error enviando PDF a ${number}:`, pdfNotifyError);
          }
        }
      }
    }

    return NextResponse.json({ success: true, ticket: ticketNumber, pdfUrl }, { status: 201 });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Error del Servidor' }, { status: 500 });
  }
}
