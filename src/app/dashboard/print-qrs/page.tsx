import { getSessionTenantId, getUnitsByTenant, getTenantConfig } from '@/lib/dal';
import { Unit } from '@/lib/types';
import QRCode from 'qrcode';
import { Printer, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

export default async function PrintQRsPage() {
  const tenantId = await getSessionTenantId();
  const { data: units } = await getUnitsByTenant(tenantId);
  const { data: tenant } = await getTenantConfig(tenantId);

  // Generar los dataURLs de los QRs en el servidor
  const unitsWithQR = await Promise.all((units || []).map(async (unit: Unit) => {
    const targetUrl = `https://activaqr2.vercel.app/?tenantId=${tenantId}&unitId=${unit.id}`;
    const qrCode = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: tenant?.brand_color || '#000000',
        light: '#FFFFFF'
      }
    });
    return { ...unit, qrCode };
  }));

  return (
    <div className="min-h-screen bg-white text-black p-8 sm:p-12">
      {/* Top Bar for UI (hidden in print) */}
      <div className="flex justify-between items-center mb-10 print:hidden no-print">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold text-sm"
        >
          <ChevronLeft size={20} />
          Volver al Dashboard
        </Link>
        <PrintButton />
      </div>

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 border-b pb-8">
          {tenant?.logo_url && (
            <img src={tenant.logo_url} alt={tenant.name} className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Catálogo de Códigos QR</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
            Flota de {tenant?.name} — Total: {units?.length} unidades
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 print:grid-cols-3">
          {unitsWithQR.map((unit) => (
            <div key={unit.id} className="flex flex-col items-center border p-6 rounded-3xl break-inside-avoid">
              <img src={unit.qrCode} alt={`QR ${unit.unit_code}`} className="w-full aspect-square mb-4" />
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Unidad</p>
                <p className="text-2xl font-black italic tracking-tighter leading-none mb-2">{unit.unit_code}</p>
                <div className="px-3 py-1 bg-black text-white text-[8px] font-black rounded-full uppercase tracking-[0.2em] inline-block">
                  {unit.plate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { padding: 0 !important; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
