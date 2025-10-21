# 🚀 DESPEGA Content Studio

**Generador de Carruseles con IA para Instagram**  
Especializado en Mercado Libre y el Método DESPEGA

---

## 📋 Descripción

DESPEGA Content Studio es una herramienta que utiliza Inteligencia Artificial (Claude de Anthropic) para generar carruseles profesionales de 5 slides para Instagram, junto con el copy optimizado para acompañar la publicación.

### ✨ Características Principales

- 🎨 **Generación automática de 5 slides** con contenido alineado al Método DESPEGA
- 📝 **Copy de Instagram** en 3 estilos (Completo, Minimalista, Educativo)
- 🖼️ **3 formatos de imagen** (Cuadrado, Vertical, Horizontal)
- 🔄 **Regeneración selectiva** de slides individuales o copy
- ⬇️ **Descarga automática** de los 5 slides como archivos separados
- 🎯 **Identidad de marca EME360PRO** integrada en el diseño

---

## 🎯 Identidad de Marca

### Paleta de Colores
- **Azul Confiable:** `#2C5F8D` (Principal)
- **Crema Suave:** `#F5F0E8` (Secundario)
- **Verde Oliva:** `#8B9D77` (Acento/CTA)

### Tipografías
- **Títulos:** Libre Baskerville (Bold)
- **Cuerpo:** Open Sans (Regular/Semibold)

### Firma
Todos los posts incluyen: **#DESPEGAconOdiley**

---

## 🛠️ Tecnologías

### Backend
- **Node.js** v18+
- **Express.js** - Framework web
- **Claude AI API** (Anthropic) - Generación de contenido
- **node-fetch** - HTTP client
- **dotenv** - Variables de entorno

### Frontend
- **HTML5/CSS3/JavaScript ES6+**
- **html2canvas** - Generación de imágenes
- **Google Fonts** - Tipografías

---

## 📦 Instalación

### Requisitos Previos
- Node.js v18 o superior
- API Key de Claude (Anthropic)

### Paso 1: Clonar o Descargar el Proyecto
```bash
cd despega-content-studio
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

Edita `.env` y agrega tu API Key de Claude:
```
CLAUDE_API_KEY=sk-ant-api03-xxxxx...
PORT=3000
```

**¿Cómo obtener tu API Key?**
1. Ve a [https://console.anthropic.com/](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" y genera una nueva
4. Copia y pega en tu archivo `.env`

### Paso 4: Iniciar el Servidor
```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## 🚀 Uso

### 1. Crear un Carrusel

1. **Sube una imagen** (JPG/PNG, máx 10MB)
   - Esta imagen aparecerá de fondo en los slides 1-4
   
2. **Escribe el tema** del carrusel
   - Ejemplo: "Mitos sobre vender en Mercado Libre"
   - Ejemplo: "3 errores al configurar tu cuenta"
   
3. **Selecciona el formato**
   - Cuadrado: 1080x1080 (Feed)
   - Vertical: 1080x1350 (Stories/Reels)
   - Horizontal: 1080x566 (Landscape)
   
4. **Elige el estilo de copy**
   - **Completo Profesional:** 200-300 palabras
   - **Minimalista:** 80-120 palabras
   - **Educativo Largo:** 300-450 palabras
   
5. **Click en "Generar Carrusel con IA"**

### 2. Revisar y Editar

- Navega entre los slides con las flechas
- Si un slide no te convence: **"Regenerar este slide"**
- Si el copy necesita ajuste: **"Regenerar Copy"**
- Copia el copy al portapapeles: **"Copiar Copy"**

### 3. Descargar

- Click en **"Descargar Carrusel Completo"**
- Se descargarán automáticamente los 5 slides:
  - `slide-1.png`
  - `slide-2.png`
  - `slide-3.png`
  - `slide-4.png`
  - `slide-5.png`

---

## 📱 Estructura del Carrusel

### Slide 1: Portada/Hook
- Título impactante
- Subtítulo opcional
- Firma: #DESPEGAconOdiley

### Slides 2-4: Contenido
- Estructura variable según tema:
  - Mitos vs Realidades
  - Puntos numerados
  - Problema → Solución
  - Pasos secuenciales
- Firma: #DESPEGAconOdiley

### Slide 5: Cierre
- Fondo crema sólido (sin imagen)
- Título resumen
- 3 puntos clave
- Call to Action
- Firma: #DESPEGAconOdiley

---

## 🎨 System Prompt

El archivo `system-prompt-despega.md` contiene todas las instrucciones que la IA sigue para generar contenido alineado con:

- ✅ Identidad de marca EME360PRO
- ✅ Audiencia de microempresarios mexicanos
- ✅ Tono empático y claro
- ✅ Método DESPEGA (8 sesiones)
- ✅ Frases ancla de la marca

**Puedes personalizar el system prompt** editando este archivo para ajustar:
- Tono de voz
- Vocabulario específico
- Estructura de contenido
- Llamados a la acción

---

## 🔧 API Endpoints

### POST `/api/generar-carrusel`
Genera un carrusel completo de 5 slides + copy

**Request:**
```json
{
  "tema": "Mitos sobre Mercado Libre",
  "estilo_copy": "completo|minimalista|educativo"
}
```

**Response:**
```json
{
  "success": true,
  "carrusel": {
    "tema": "...",
    "slides": [...]
  },
  "copy_instagram": {
    "estilo": "completo",
    "contenido": "..."
  }
}
```

### POST `/api/regenerar-slide`
Regenera un slide específico

**Request:**
```json
{
  "tema": "...",
  "numero_slide": 2,
  "slide_actual": {...},
  "contexto_carrusel": [...]
}
```

### POST `/api/regenerar-copy`
Regenera el copy de Instagram

**Request:**
```json
{
  "tema": "...",
  "estilo_copy": "completo",
  "slides_del_carrusel": [...]
}
```

### GET `/api/health`
Health check del servidor

---

## 📂 Estructura del Proyecto

```
despega-content-studio/
│
├── package.json              # Dependencias y scripts
├── server.js                 # Servidor Express + API
├── system-prompt-despega.md  # System prompt de Claude
├── .env                      # Variables de entorno (no incluir en Git)
├── .env.example              # Ejemplo de variables
├── .gitignore               # Archivos ignorados por Git
├── README.md                # Este archivo
│
└── public/                   # Frontend
    ├── index.html           # Interfaz principal
    ├── styles.css           # Estilos con identidad EME360PRO
    └── script.js            # Lógica del cliente
```

---

## 🚀 Despliegue

### Opción 1: Local (Desarrollo)
```bash
npm start
```

### Opción 2: Railway (Recomendado para producción)
1. Crea cuenta en [Railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Agrega variable de entorno `CLAUDE_API_KEY`
4. Deploy automático

### Opción 3: Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```
Configura `CLAUDE_API_KEY` en el dashboard de Vercel

### Opción 4: Heroku
```bash
heroku create despega-content-studio
heroku config:set CLAUDE_API_KEY=tu-api-key
git push heroku main
```

---

## 💰 Costos de API

**Claude API (Anthropic):**
- Modelo: `claude-sonnet-4-20250514`
- Costo aproximado: **$0.003 - $0.005 USD** por carrusel completo
- Incluye: 5 slides + copy + posibles regeneraciones

**Ejemplo:**
- 100 carruseles/mes ≈ $0.50 USD
- 500 carruseles/mes ≈ $2.50 USD

---

## ⚠️ Consideraciones de Seguridad

### Producción
- ✅ Usa HTTPS (certificado SSL)
- ✅ No expongas `.env` en Git
- ✅ Implementa rate limiting
- ✅ Valida todos los inputs del usuario
- ✅ Monitorea uso de API

### Variables de Entorno
```bash
# NUNCA hagas esto:
git add .env

# Siempre usa .gitignore
# Y configura variables en el hosting
```

---

## 🐛 Troubleshooting

### Error: "API Key no configurada"
- Verifica que tu archivo `.env` existe
- Asegúrate de que la variable se llama `CLAUDE_API_KEY`
- Reinicia el servidor después de crear el `.env`

### Error: "La imagen es muy pesada"
- Reduce el tamaño de la imagen (máx 10MB)
- Usa herramientas de compresión como TinyPNG

### La descarga no funciona
- Verifica que tu navegador permite descargas múltiples
- Algunos navegadores bloquean descargas automáticas

### El texto no se ve bien en el slide
- Ajusta el tamaño del texto en `script.js` (función `crearCanvasSlide`)
- Experimenta con diferentes pesos de fuente

---

## 📝 Personalización

### Cambiar Colores de Marca
Edita `public/styles.css`:
```css
:root {
    --azul-confiable: #TU_COLOR;
    --verde-oliva: #TU_COLOR;
    --crema-suave: #TU_COLOR;
}
```

### Cambiar System Prompt
Edita `system-prompt-despega.md`:
- Modifica el tono de voz
- Ajusta las frases ancla
- Cambia la estructura de slides

### Cambiar Firma
Edita `system-prompt-despega.md` y busca todas las referencias a `#DESPEGAconOdiley`

---

## 📞 Soporte

**Creado por:** Odiley Vargas  
**Marca:** EME360PRO  
**Versión:** 1.0.0  
**Fecha:** Octubre 2025

---

## 📄 Licencia

MIT License - Uso libre para proyectos personales y comerciales

---

## 🎯 Roadmap Futuro

- [ ] Modo batch: Generar múltiples carruseles a la vez
- [ ] Plantillas predefinidas por sesión DESPEGA
- [ ] Integración con APIs de imágenes (Unsplash, Pexels)
- [ ] Editor visual de slides
- [ ] Programación directa a Instagram
- [ ] Analytics de rendimiento de carruseles

---

**"Tu experiencia vendiendo vale más que saber de tecnología"**  
*- Odiley Vargas | Método DESPEGA*

🚀 **De tu local a todo México en 8 sesiones**
