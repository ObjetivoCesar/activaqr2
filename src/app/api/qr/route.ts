import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const unitId = searchParams.get('unitId');

  if (!tenantId || !unitId) {
    return NextResponse.json({ error: 'Missing tenantId or unitId' }, { status: 400 });
  }
  
  const { data: unit, error } = await supabase
    .from('activaqr2_units')
    .select('*, activaqr2_tenants(*)')
    .eq('id', unitId)
    .single();

  if (error || !unit || unit.tenant_id !== tenantId) {
    return NextResponse.json({ error: 'Unidad o tenant no encontrado' }, { status: 404 });
  }

  const tenant = unit.activaqr2_tenants;
  
  // URL final donde apuntará el QR (El formulario en este mismo proyecto Next.js)
  const encodedUrl = encodeURIComponent(`https://activaqr2.vercel.app/?tenantId=${tenantId}&unitId=${unitId}`);
  // Temporary: change encoded URL logic later to handle full URL correctly.
  const targetUrl = `https://activaqr2.vercel.app/?tenantId=${tenantId}&unitId=${unitId}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: tenant.theme_hex || '#000000',
        light: '#FFFFFF'
      }
    });
    
    return NextResponse.json({ qrCode: qrCodeDataUrl, targetUrl }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error generando el código QR' }, { status: 500 });
  }
}
