import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * Endpoint para verificar disponibilidad de Slug o Email en tiempo real
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const email = searchParams.get('email');

  if (slug) {
    const { data } = await supabase
      .from('activaqr2_tenants')
      .select('id')
      .contains('vcard_name', { slug: slug.toLowerCase().trim() })
      .maybeSingle();

    return NextResponse.json({ 
      available: !data,
      message: data ? 'Este nombre de enlace ya está ocupado' : '¡Enlace disponible!'
    });
  }

  if (email) {
    const { data } = await supabase
      .from('activaqr2_tenants')
      .select('id')
      .eq('linked_email', email.toLowerCase().trim())
      .maybeSingle();

    return NextResponse.json({ 
      available: !data,
      message: data ? 'Este correo ya tiene una cuenta activa' : 'Correo disponible para registro'
    });
  }

  return NextResponse.json({ error: 'Parámetro slug o email requerido' }, { status: 400 });
}

/**
 * Función para verificar la firma HMAC
 */
function verifySignature(payload: any, signature: string, secret: string) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature');
    const secret = process.env.EXTERNAL_API_SECRET || 'activaqr_bridge_secret_2026';

    if (!signature || !verifySignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Firma digital inválida o ausente' }, { status: 401 });
    }

    const { name, email, whatsapp, plan, orderId, paymentStatus, slug } = body;

    // 1. Verificación de Existencia de Email
    const { data: existingTenant } = await supabase
      .from('activaqr2_tenants')
      .select('id')
      .eq('linked_email', email)
      .maybeSingle();

    if (existingTenant) {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 });
    }

    // 2. Crear el Tenant con Registro de Setup Fee
    const vcardData = JSON.stringify({ slug, name });
    const { data, error } = await supabase
      .from('activaqr2_tenants')
      .insert({
        name,
        linked_email: email,
        whatsapp_number: whatsapp,
        vcard_name: vcardData,
        subscription_status: paymentStatus === 'paid' ? 'active' : 'pending_approval',
        plan: plan || 'pro_lead',
        registration_source: 'activaqr_main_site',
        metadata: { 
          external_order_id: orderId,
          setup_fee_paid: 100.00,
          monthly_subscription: 13.00,
          currency: 'USD'
        }
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Magic Setup (Unidades Demo)
    await supabase.from('activaqr2_units').insert([
      { tenant_id: data.id, name: 'Unidad Demo 1', plate_number: 'VIP-001', status: 'active' },
      { tenant_id: data.id, name: 'Unidad Demo 2', plate_number: 'VIP-002', status: 'active' }
    ]);

    return NextResponse.json({ 
      success: true, 
      tenantId: data.id,
      slug: slug,
      message: 'Cuenta creada con Setup Fee registrado.'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
