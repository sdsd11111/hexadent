---
description: Correcciones de calidad para respuestas del chatbot Hexadent
---

# Chatbot Quality Fixes - Skill

## Problemas Corregidos

### 1. Puntuación de Preguntas (¿...?)
**Regla:** TODA pregunta DEBE iniciar con "¿" y terminar con "?"

**Ejemplos:**
- ✅ Correcto: "¿En qué podemos ayudarle?"
- ❌ Prohibido: "¿En qué podemos ayudarle" (sin cerrar)
- ❌ Prohibido: "En qué podemos ayudarle?" (sin abrir)

**Implementación:**
- System prompt incluye: `REGLA DE PUNTUACIÓN DE PREGUNTAS`
- Post-processing detecta y corrige automáticamente

### 2. Caracteres "?" Sueltos (Errores de Encoding)
**Regla:** Cuando el LLM genera "?" en lugar de emoji, reemplazarlos

**Mapeo:**
- `?` al final de mensaje → `😊`
- `?` entre frases → `👍`
- `?` después de palabra (no pregunta) → eliminar

**Implementación:**
```javascript
finalResponseText = finalResponseText.replace(/\?\s*$/g, ' 😊');
finalResponseText = finalResponseText.replace(/\?\s+(?=[A-ZÁÉÍÓÚ¿])/g, ' 👍 ');
finalResponseText = finalResponseText.replace(/([a-záéíóúñ])\?(\s)/gi, '$1$2');
```

### 3. Prioridad de Fechas
**Regla:** Cuando no hay horarios para hoy, ofrecer en este orden:
1. **MAÑANA** (primera opción)
2. **Pasado mañana** (segunda opción)
3. **Próxima semana** (solo si es necesario)

**Prohibido:** Saltar directamente a "la próxima semana" si mañana está disponible.

**Implementación:**
- System prompt: `REGLA DE PRIORIDAD DE FECHAS`

### 4. Formato de Horarios Tarde
**Regla:** Para horarios 15:00-18:00, está PROHIBIDO listar cada slot.

**Correcto:**
> "Tenemos disponibilidad de 15:00 a 17:30. ¿Algún horario en ese rango le funciona?"

**Prohibido:**
> "15:00, 15:15, 15:30, 15:45, 16:00, 16:15, 16:30, 16:45, 17:00..."

**Excepción:** Solo si el usuario pide explícitamente "dame la lista completa".

**Implementación:**
- System prompt: `REGLA DE FORMATO DE HORARIOS TARDE`

### 5. Horarios Disponibles Tarde
**Regla:** Mostrar hasta 17:30 (incluyendo 17:15, 17:30)

**Jornada Tarde Completa:** 15:00 - 17:30

**Implementación:**
- `calendar_helper.js` genera slots hasta 17:30
- Post-processing asegura mencionar el rango completo

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `lib/chatbot/logic.js` | Nuevas reglas en system prompt, post-processing de puntuación |
| `lib/chatbot/scripts/calendar_helper.js` | Horarios hasta 17:30 |

## Testing

Para probar estas correcciones:

1. **Puntuación:** Escribir "Hola" → Verificar saludo termina con `?`
2. **Fechas:** A las 12:00 pedir horario "para hoy" → Debe ofrecer mañana, no próxima semana
3. **Horarios tarde:** Pedir "horarios de la tarde" → Debe decir "15:00 a 17:30", no lista
4. **Encoding:** Verificar que no aparezcan "?" sueltos en lugar de emojis

## Notas

- El warning `url.parse()` es deprecation de Node.js, NO crítico
- DeepSeek LLM está configurado como proveedor principal
- Si todos los LLM fallan, se muestra mensaje de fallback amigable
