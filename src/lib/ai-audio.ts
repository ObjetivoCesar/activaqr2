import { GoogleGenerativeAI } from "@google/generative-ai";
// Rebuild triggered after install

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

/**
 * Procesa un audio para obtener transcripción y análisis.
 * @param audioUrl URL del archivo de audio
 * @returns Transcripción, Calidad y Sentimiento
 */
export async function processAudioReport(audioUrl: string) {
  try {
    // 1. Descargar el audio
    const response = await fetch(audioUrl);
    const audioBuffer = await response.arrayBuffer();

    // 2. Inicializar Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Crear el prompt para análisis objetivo
    const prompt = `
      Analiza el siguiente audio de un reporte de transporte público y responde únicamente en formato JSON:
      {
        "transcripcion": "Texto exacto de lo que se dice",
        "audibilidad": "Número del 0 al 100 indicando qué tan claro se escucha",
        "sentimiento": "Palabra clave: Positivo, Neutro o Negativo",
        "resumen_ejecutivo": "Breve resumen de 10 palabras"
      }
      Sé objetivo y no emitas juicios de valor.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(audioBuffer).toString("base64"),
          mimeType: "audio/mpeg" // O el tipo correspondiente
        }
      }
    ]);

    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error en processAudioReport:", error);
    return {
      transcripcion: "No se pudo transcribir el audio automáticamente.",
      audibilidad: 0,
      sentimiento: "Indeterminado",
      resumen_ejecutivo: "Fallo en procesamiento de audio."
    };
  }
}
