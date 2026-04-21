const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function checkStatus() {
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

  try {
    const response = await axios.get(
      `${API_URL}/instance/connectionStatus/${INSTANCE}`,
      {
        headers: {
          'apikey': API_KEY
        }
      }
    );

    console.log('📡 ESTATUS DE CONEXIÓN:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ ERROR OBTENIENDO ESTATUS:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Mensaje:', error.message);
    }
  }
}

checkStatus();
