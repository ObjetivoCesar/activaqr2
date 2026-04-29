# ActivaQR Master Blueprint

Este skill es el "Plano Maestro" del ecosistema ActivaQR. Define la relación entre ActivaQR1 (público/ventas) y ActivaQR2 (SaaS/gestión), asegurando coherencia visual, técnica y de seguridad.

## 1. Visión del Ecosistema
*   **ActivaQR1 (Contacto-QR):** Cara pública, motor de ventas y portal de captación de leads.
*   **ActivaQR2 (SaaS Central):** Motor de Inteligencia y Auditoría de Calidad. Gestiona "unidades evaluables" (vehículos, mesas, aulas, vendedores) y procesa feedback masivo mediante IA para entregar reportes estratégicos a la gerencia.

## 2. Arquitectura de Integración (The Bridge)
*   **Endpoint:** `POST /api/external/register-lead`
*   **Seguridad:** Requiere `EXTERNAL_API_SECRET` y validación de `Origin/Referer`.
*   **Lógica de Pago:** 
    *   `paymentStatus: "pending"` -> Estado: `pending_approval`.
    *   `paymentStatus: "paid"` -> Estado: `active`.
*   **Metadata:** Almacena `external_order_id` para trazabilidad con ActivaQR1.

## 3. Protocolo de Seguridad "Búnker"
En caso de intentos de hackeo o spam, Antigravity debe aplicar:
1.  **CORS Estricto:** Permitir solo dominios autorizados (`activaqr.com`).
2.  **Rate Limiting:** Máximo 5 peticiones por IP en 10 minutos para la API de leads.
3.  **Firma HMAC:** Futura implementación para validar que cada petición fue firmada por ActivaQR1 usando una clave privada compartida.
4.  **Backups:** Sincronización diaria con Supabase para garantizar recuperación total ante ransomware.

## 4. Estándares de UI/UX (Branding)
*   **Colores:** Navy (`#001549`), Tomate (`#f66739`), Crema (`#FCF9F5`).
*   **Fuentes:** Montserrat (Títulos), Inter (Cuerpo).
*   **Concepto de "Unidad":** Universal. Se adapta según el tenant (Bus, Mesa, Vendedor, Aula).
*   **Regla de Scroll:**
    *   **Modo Feedback (Público):** Layout fijo (`fixed-chat-view`), sin scroll global en móvil, simulando WhatsApp para mayor enfoque en el reporte.
    *   **Modo Gestión (Admin/Dashboard):** Scroll natural liberado para análisis de datos y formularios.

## 5. Herramientas de Inteligencia (IA Audit)
*   **Procesamiento de Voz:** Transcripción automática de quejas/sugerencias enviadas por audio.
*   **Análisis de Sentimiento:** Clasificación automática de la urgencia y tono del feedback.
*   **Magic Demo:** Generador instantáneo de unidades de prueba para cualquier sector (Transporte, Ventas, Restaurantes).

## 6. Roadmap de Escalabilidad
*   Futura unificación de bases de datos bajo un solo clúster.
*   Migración de ActivaQR1 a la arquitectura de ActivaQR2 para una experiencia Single Sign-On (SSO).
