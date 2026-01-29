# 📖 Guía Técnica: Visibilidad LLM con Contenido Oculto

## 🎯 El Problema
Los **LLMs (ChatGPT, Claude, Perplexity)** y **crawlers** solo leen el **HTML inicial** del servidor. El contenido generado por Client Components (`'use client'`) es invisible para ellos.

## ✅ La Solución: Contenido Oculto Server-Side
Agregamos **todo el contenido importante** en el **HTML inicial** (Server Component), pero lo **ocultamos visualmente** con CSS.

## 🔧 El Patrón Exacto

### Estructura de Archivo
```
app/servicios/mi-servicio/
├── page.tsx           ← Server Component (metadata + contenido oculto)
└── MiServicioClient.tsx ← Client Component (UI interactiva)
```

### Código del Patrón
```typescript
// ✅ page.tsx (Server Component)
import { Metadata } from 'next';
import MiServicioClient from './MiServicioClient';

export const metadata: Metadata = {
  title: 'Mi Servicio | Tu Empresa',
  description: 'Descripción breve...',
};

export default function MiServicioPage() {
  return (
    <>
      {/* 1️⃣ Componente interactivo visual */}
      <MiServicioClient />
      
      {/* 2️⃣ Contenido oculto para LLMs/SEO */}
      <div style={{ 
        position: 'absolute',
        left: '-10000px',      // Fuera de la pantalla
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }} 
      aria-hidden="true">     {/* Ignorado por screen readers */}
        
        <h1>Título Principal del Servicio</h1>
        <p>Descripción completa del servicio aquí.</p>
        
        <h2>Precio</h2>
        <p>Precio exacto: $XXX USD</p>
        
        <h2>Beneficios Clave</h2>
        <ul>
          <li>Beneficio 1...</li>
        </ul>
      </div>
    </>
  );
}
```

## ⚠️ Mejores Prácticas
1. **HTML Semántico**: Usa `h1`, `h2`, `p`, `ul` dentro del div oculto.
2. **Sincronización**: Si cambias el texto en el Client Component, actualízalo en el `page.tsx`.
3. **Precios**: Siempre incluye los precios exactos en el contenido oculto.
4. **NO usar `display: none`**: Google puede penalizarlo. Usa `position: absolute` off-screen.
