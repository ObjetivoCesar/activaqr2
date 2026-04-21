const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function debug() {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = Object.fromEntries(
    envContent.split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => line.split('=').map(s => s.trim()))
  );

  const API_URL = env.EVOLUTION_API_URL;
  const API_KEY = env.EVOLUTION_API_KEY;
  const INSTANCE = env.EVOLUTION_INSTANCE_NAME;

  console.log('📡 Configuración:');
  console.log('URL:', API_URL);
  console.log('Instancia:', INSTANCE);

  const number = '593963410409'; // Tu número
  const text = '🚀 Prueba de depuración ActivaQR desde el servidor.';

  try {
    const response = await axios.post(
      `${API_URL}/message/sendText/${INSTANCE}`,
      {
        number: number,
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

    console.log('✅ ÉXITO:', response.data);
  } catch (error) {
    console.error('❌ ERROR:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Mensaje:', error.message);
    }
  }
}

debug();
