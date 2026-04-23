import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateReportPDF } from '@/lib/pdf-generator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Obtener datos del reporte incluyendo relaciones
    const { data: report, error: reportError } = await supabase
      .from('activaqr2_reports')
      .select('*, activaqr2_units!inner(*, activaqr2_tenants(*))')
      .eq('id', id)
      .single();

    if (reportError || !report) {
      console.error('Report not found for PDF proxy:', reportError);
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }

    // 2. Verificar si ya tiene un PDF en metadata
    let pdfUrl = (report.metadata as any)?.pdf_url;

    if (!pdfUrl) {
      console.log(`Generando PDF bajo demanda para el reporte: ${id}`);
      // 3. Generar PDF si no existe (para reportes antiguos)
      const unit = report.activaqr2_units;
      const tenant = unit?.activaqr2_tenants;
      
      // Adaptar el objeto para que coincida con lo que espera generateReportPDF
      const reportPayload = { ...report };
      
      pdfUrl = await generateReportPDF(reportPayload, unit, tenant);
      
      // Actualizar metadata para futuras consultas
      await supabase
        .from('activaqr2_reports')
        .update({ 
          metadata: { 
            ...((report.metadata as any) || {}), 
            pdf_url: pdfUrl 
          } 
        })
        .eq('id', id);
    }

    // 4. Redirigir a la URL pública del PDF (archivo crudo)
    // Esto asegura que el navegador vea un .pdf y no la página de la aplicación
    return NextResponse.redirect(pdfUrl);

  } catch (err: any) {
    console.error('Error en el proxy de PDF:', err);
    return NextResponse.json({ error: 'Error al procesar el PDF', details: err.message }, { status: 500 });
  }
}
