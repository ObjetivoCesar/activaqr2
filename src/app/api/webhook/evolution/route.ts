import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_API_KEY;
const EVO_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // 1. Validar que sea un mensaje entrante (upsert)
    if (payload.event !== 'messages.upsert' || !payload.data?.message) {
      return NextResponse.json({ status: 'ignored' });
    }

    const message = payload.data;
    const remoteJid = message.key.remoteJid;
    const pushName = message.pushName || 'Pasajero';
    
    // Extraer texto del mensaje (puede venir en different formats)
    const text = message.message.conversation || 
                 message.message.extendedTextMessage?.text || 
                 "";

    console.log(`📩 Mensaje de ${remoteJid}: "${text}"`);

    // 2. Detección de Ticket (La Bomba 💣)
    const ticketMatch = text.match(/TKT-([A-Z0-9]{5,8})/i);
    
    if (ticketMatch) {
      const ticketId = ticketMatch[1].toUpperCase();
      console.log(`🔍 Buscando reporte para Ticket: #${ticketId}`);

      // 3. Consultar DB: Reporte + Unidad + Tenant
      const { data: report, error } = await supabase
        .from('activaqr2_reports')
        .select(`
          *,
          activaqr2_units!inner (
            unit_code,
            activaqr2_tenants!inner (*)
          )
        `)
        .eq('ticket_number', ticketId)
        .single();

      if (error || !report) {
         console.error('❌ Reporte no encontrado:', error?.message);
         return NextResponse.json({ status: 'not_found' });
      }

      const tenantRaw = (report.activaqr2_units as any).activaqr2_tenants;
      const tenant = Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw;
      
      const vcardName = tenant.vcard_name || tenant.name || 'Soporte ActivaQR';
      const waNumber = tenant.whatsapp_number || 'Soporte';

      // 4. Generación de vCard Dinámica
      const vcardString = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${tenant.name}\nTEL;TYPE=WORK,VOICE;waid=${waNumber}:${waNumber}\nNOTE:Soporte Oficial - Ticket #${ticketId}\nEND:VCARD`;

      // 5. Envío de vCard vía Evolution API
      // Usamos el endpoint sendContact que es más "nativo"
      await fetch(`${EVO_URL}/message/sendContact/${EVO_INSTANCE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVO_KEY!
        },
        body: JSON.stringify({
          number: remoteJid,
          contact: [{
            fullName: vcardName,
            vcard: vcardString
          }]
        })
      });

      // 6. Mensaje de Agradecimiento y CRM (Placeholder)
      await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVO_KEY!
        },
        body: JSON.stringify({
          number: remoteJid,
          text: `✅ ¡Hola ${pushName}! He verificado tu ticket *#${ticketId}*.\n\nTe acabo de enviar el contacto oficial de la empresa. *Guárdalo ahora* para recibir actualizaciones de tu reporte.\n\n¡Gracias por ayudarnos a mejorar!`
        })
      });

      console.log(`✅ Automatización completada para ${remoteJid}`);

      // 7. TODO: Sincronizar con Google Contacts aquí
      // if (tenant.google_token_json) { ... }
    }
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err: any) {
    console.error('❌ Error Webhook:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
