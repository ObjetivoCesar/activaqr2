import axios from 'axios';

const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME;

export async function sendWhatsAppMessage(number: string, text: string) {
  if (!API_URL || !API_KEY || !INSTANCE) {
    console.error('❌ Credenciales de Evolution API no configuradas');
    return;
  }

  const cleanNumber = number.replace(/\D/g, '');

  try {
    const response = await axios.post(
      `${API_URL}/message/sendText/${INSTANCE}`,
      {
        number: cleanNumber,
        text: text,
        linkPreview: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      }
    );

    console.log('✅ Mensaje enviado vía Evolution:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error enviando mensaje Evolution:', error.response?.data || error.message);
    throw error;
  }
}

export async function sendWhatsAppDocument(number: string, mediaUrl: string, fileName: string, caption?: string) {
  if (!API_URL || !API_KEY || !INSTANCE) {
    console.error('❌ Credenciales de Evolution API no configuradas');
    return;
  }

  const cleanNumber = number.replace(/\D/g, '');

  try {
    const response = await axios.post(
      `${API_URL}/message/sendMedia/${INSTANCE}`,
      {
        number: cleanNumber,
        mediatype: 'document',
        mimetype: 'application/pdf',
        media: mediaUrl,
        fileName: fileName,
        caption: caption || ''
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      }
    );

    console.log('✅ PDF enviado como documento vía Evolution:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error enviando documento Evolution:', error.response?.data || error.message);
    throw error;
  }
}

