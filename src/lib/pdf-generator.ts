import PDFDocument from 'pdfkit';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export async function generateReportPDF(reportData: any, unitData: any, tenantData: any) {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        bufferPages: true,
        info: {
          Title: `Reporte ${reportData.ticket_number}`,
          Author: 'ActivaQR2 System',
        }
      });

      const chunks: any[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const result = Buffer.concat(chunks);
          const fileName = `reports/PDF-${reportData.ticket_number}-${uuidv4()}.pdf`;
          
          const { error: uploadError } = await supabase.storage
            .from('reports-media')
            .upload(fileName, result, {
              contentType: 'application/pdf',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('reports-media')
            .getPublicUrl(fileName);

          resolve(publicUrl);
        } catch (uploadErr) {
          reject(uploadErr);
        }
      });

      // --- OBTENER LOGO ---
      let logoBuffer;
      if (tenantData.logo_url) {
        try {
          const response = await fetch(tenantData.logo_url);
          if (response.ok) {
            logoBuffer = Buffer.from(await response.arrayBuffer());
          }
        } catch (e) {
          console.error("Error obteniendo logo para PDF:", e);
        }
      }

      // --- DISEÑO PREMIUM ---
      const brandColor = tenantData.brand_color || '#075E54';
      
      // Header Background
      doc.rect(0, 0, doc.page.width, 120).fill(brandColor);
      
      // Logo y Título
      if (logoBuffer) {
        try {
          // Ajustar logo a la izquierda
          doc.image(logoBuffer, 50, 30, { height: 60 });
          doc.fillColor('#FFFFFF')
             .fontSize(22)
             .font('Helvetica-Bold')
             .text((tenantData.name || 'ACTIVAQR').toUpperCase(), 135, 45, { characterSpacing: 1 });
        } catch (imgErr) {
          doc.fillColor('#FFFFFF')
             .fontSize(28)
             .font('Helvetica-Bold')
             .text((tenantData.name || 'ACTIVAQR').toUpperCase(), 50, 45, { characterSpacing: 2 });
        }
      } else {
        doc.fillColor('#FFFFFF')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text((tenantData.name || 'ACTIVAQR').toUpperCase(), 50, 45, { characterSpacing: 2 });
      }
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#FFFFFF')
         .text('SISTEMA INTEGRAL DE GESTIÓN Y SEGURIDAD VIAL', logoBuffer ? 135 : 50, 80, { characterSpacing: 0.5 });

      // Ticket Badge
      doc.rect(400, 40, 150, 40).fill('#FFFFFF');
      doc.fillColor(brandColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(reportData.ticket_number, 400, 55, { width: 150, align: 'center' });

      // Body Start
      let currentY = 150;

      // Report Header
      doc.fillColor('#333333').fontSize(16).font('Helvetica-Bold').text('REPORTE FORMAL DE INCIDENTE', 50, currentY);
      currentY += 25;
      
      doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generado el: ${new Date().toLocaleString()}`, 50, currentY);
      currentY += 40;

      // Info Grid
      const drawInfoRow = (label: string, value: string, y: number) => {
        doc.fillColor('#999999').fontSize(9).font('Helvetica').text(label.toUpperCase(), 50, y);
        doc.fillColor('#1A1A1A').fontSize(11).font('Helvetica-Bold').text(value || 'N/A', 180, y);
        return y + 25;
      };

      doc.rect(50, currentY - 10, 500, 1).fill('#EEEEEE');
      currentY += 15;

      currentY = drawInfoRow('Tipo de Evento', reportData.type?.toUpperCase(), currentY);
      currentY = drawInfoRow('Código Unidad', unitData.unit_code, currentY);
      currentY = drawInfoRow('Placa / ID', unitData.plate, currentY);
      currentY = drawInfoRow('Conductor', unitData.driver_name, currentY);
      if (reportData.rating) {
        currentY = drawInfoRow('Calificación', `${reportData.rating} / 5 Estrellas`, currentY);
      }

      currentY += 15;
      doc.rect(50, currentY - 10, 500, 1).fill('#EEEEEE');
      currentY += 15;

      // Description
      doc.fillColor('#999999').fontSize(9).font('Helvetica').text('DESCRIPCIÓN Y DETALLES:', 50, currentY);
      currentY += 20;
      doc.fillColor('#333333').fontSize(11).font('Helvetica').text(reportData.description || 'Sin descripción detallada.', 50, currentY, { width: 500, lineGap: 5 });
      
      currentY = doc.y + 40;

      // Multimedia Evidence
      doc.fillColor(brandColor).fontSize(14).font('Helvetica-Bold').text('EVIDENCIAS ADJUNTAS', 50, currentY);
      currentY += 25;

      if (reportData.media_url) {
        const urls = reportData.media_url.split(',');
        urls.forEach((url: string, index: number) => {
          const trimmedUrl = url.trim();
          const isVideo = trimmedUrl.toLowerCase().includes('video') || trimmedUrl.toLowerCase().includes('.mp4');
          const isAudio = trimmedUrl.toLowerCase().includes('audio') || trimmedUrl.toLowerCase().includes('.webm') || trimmedUrl.toLowerCase().includes('.mp3');
          const typeLabel = isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : 'IMAGEN';

          if (currentY > 720) {
             doc.addPage();
             currentY = 50;
          }

          doc.rect(50, currentY, 500, 30).fill('#F8F9FA');
          doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text(`${typeLabel} - Evidencia #${index + 1}`, 65, currentY + 10);
          doc.fillColor('#0066CC').fontSize(9).font('Helvetica').text('VER ARCHIVO', 430, currentY + 10, { link: trimmedUrl, underline: true });
          
          currentY += 35;
        });
      } else {
        doc.fillColor('#999999').fontSize(10).font('Helvetica').text('No se registraron archivos multimedia en este reporte.', 50, currentY);
        currentY += 25;
      }

      // Location
      if (reportData.location_lat && reportData.location_lng) {
        if (currentY > 720) { doc.addPage(); currentY = 50; }
        currentY += 15;
        doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold').text('UBICACIÓN GEOGRÁFICA', 50, currentY);
        currentY += 20;
        const mapUrl = `https://www.google.com/maps?q=${reportData.location_lat},${reportData.location_lng}`;
        doc.fillColor('#0066CC').fontSize(10).font('Helvetica').text('Ver punto de origen en Google Maps', 50, currentY, { link: mapUrl, underline: true });
      }

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        const bottom = doc.page.height - 50;
        doc.rect(0, bottom - 10, doc.page.width, 60).fill('#F4F4F4');
        doc.fillColor('#999999').fontSize(8).font('Helvetica').text('ACTIVAQR2 - TECNOLOGÍA PARA LA SEGURIDAD VIAL', 50, bottom + 5, { align: 'left' });
        doc.text(`Página ${i + 1} de ${pages.count}`, 0, bottom + 5, { align: 'right', width: doc.page.width - 50 });
      }

      doc.end();
    } catch (err) {
      console.error('Error interno en generador PDF:', err);
      reject(err);
    }
  });
}
