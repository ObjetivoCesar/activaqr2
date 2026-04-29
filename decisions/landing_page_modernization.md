# Decisión de Diseño: Modernización de Landing Page de Tenants

## Contexto
El perfil público de los tenants (cooperativas) presentaba una navegación fragmentada, problemas de scroll y una estética visual básica que no reflejaba un servicio premium.

## Soluciones Implementadas

### 1. Sistema de Navegación Vertical
- **Problema:** El sitio estaba bloqueado con `overflow: hidden`, forzando una navegación tipo "tab" artificial.
- **Decisión:** Habilitar scroll global y usar `scroll-smooth` para una experiencia de landing page moderna.

### 2. Componentes Adaptativos (Sliders vs Grillas)
- **Problema:** Las grillas de servicios ocupaban demasiado espacio vertical en móvil.
- **Decisión:** Implementar un sistema híbrido usando CSS Snap. 
  - **Móvil:** Slider horizontal (`flex overflow-x-auto snap-x`).
  - **Desktop:** Grilla estructurada (`md:grid`).
- **Beneficio:** Mejora la densidad de información en móvil y mantiene la visibilidad en escritorio.

### 3. Estética Glassmorphic en Flota
- **Decisión:** Usar fondos oscuros con desenfoque de fondo y bordes semitransparentes para las unidades. Esto eleva la percepción de seguridad y tecnología.

### 4. Optimización de Conversión (Redes y Mapa)
- **Decisión:** Aumentar el tamaño de los iconos sociales y vincularlos al color de marca dinámico. Simplificar el overlay del mapa para que sea útil, no solo decorativo.

## Pendientes para la Siguiente Sesión
- Validar la carga de imágenes reales de las unidades desde el dashboard.
- Probar el formulario de contacto integrado si se decide migrar del botón simple de WhatsApp.

---
*Fecha: 2026-04-27*
