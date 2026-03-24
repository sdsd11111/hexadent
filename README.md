# Hexadent - Landing Page

Landing Page profesional para el Centro Odontológico Hexadent en Loja, Ecuador.

## 🦷 Características

- **Next.js 14** con App Router
- **Tailwind CSS** para estilos
- **Mobile-First** responsive design
- **SEO optimizado** para búsquedas locales en Loja
- **WhatsApp integration** para conversión directa
- **Diseño geométrico** con formas hexagonales (sin border-radius)

## 🎨 Paleta de Colores

- **Primary (Teal)**: #13a79b
- **Secondary (Gris Carbono)**: #58595b
- **Background**: #FFFFFF

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Modo Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
hexadent-landing/
├── app/
│   ├── layout.js          # Layout principal con metadata SEO
│   ├── page.js            # Página principal
│   └── globals.css        # Estilos globales
├── components/
│   ├── Header.jsx         # Navegación sticky
│   ├── Hero.jsx           # Sección hero fullscreen
│   └── Footer.jsx         # Footer con NAP y certificaciones
├── public/
│   ├── logo.jpg           # Logo de Hexadent
│   └── hero-bg.jpg        # Imagen de fondo del hero
└── tailwind.config.js     # Configuración de Tailwind
```

## 📝 Información de Contacto

### NAP (Name, Address, Phone)
- **Nombre**: Centro Odontológico HEXA DENT
- **Dirección**: Calles Lourdes 156-46 entre Bolívar y Sucre, San Sebastián, Loja
- **Teléfono**: 0967885039

### Horarios
- **Lun-Vie**: 09:00-13:00 y 15:00-18:30
- **Sábados**: 09:30-13:00

## 👩‍⚕️ Profesional

**Dra. Diana Rodríguez**  
Especialista en Ortodoncia de Vanguardia  
Registro SENESCYT

## 🎯 SEO Keywords

- Ortodoncia en Loja
- Dentista Loja
- Brackets Loja
- Clínica dental San Sebastián
- Odontología especializada Loja

## 📦 Próximos Pasos

1. **Reemplazar placeholders de imágenes**:
   - Coloca tu logo en `/public/logo.jpg`
   - Coloca imagen de fondo en `/public/hero-bg.jpg`
   - Crea imagen Open Graph en `/public/og-image.jpg` (1200x630px)

2. **Actualizar metadata**:
   - Agregar código de verificación de Google Search Console en `app/layout.js`
   - Configurar dominio real en `metadataBase`

3. **Configurar redes sociales**:
   - Actualizar enlaces de Facebook e Instagram en `components/Footer.jsx`

4. **Agregar secciones adicionales** (Fase 2):
   - Sección "Nosotros"
   - Sección "Servicios" con tratamientos detallados
   - Galería de casos de éxito
   - Testimonios de pacientes

## 📄 Licencia

© 2026 Hexadent - Odontología Especializada. Todos los derechos reservados.
