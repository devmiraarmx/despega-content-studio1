# 🚀 GUÍA RÁPIDA - DESPEGA Content Studio

## ⚡ Instalación en 5 Minutos

### 1️⃣ Instalar Node.js
Si no lo tienes instalado:
- Descarga de: https://nodejs.org/
- Versión recomendada: 18 o superior
- Instala siguiendo las instrucciones

### 2️⃣ Abrir el Proyecto
```bash
# En Windows: Abre PowerShell o CMD en la carpeta del proyecto
cd despega-content-studio

# En Mac/Linux: Abre Terminal en la carpeta
cd despega-content-studio
```

### 3️⃣ Instalar Dependencias
```bash
npm install
```
⏱️ Espera 1-2 minutos mientras se descargan las librerías

### 4️⃣ Configurar API Key de Claude 3.5
```bash
# Copia el archivo de ejemplo
copy .env.example .env    # Windows
# o
cp .env.example .env      # Mac/Linux
```

Edita `.env` con tu editor de texto favorito y agrega tu API Key:
```
CLAUDE_API_KEY=sk-ant-api03-xxxxx...
PORT=3000
```

**¿Cómo obtener tu API Key?**
1. Ve a: https://console.anthropic.com/
2. Regístrate o inicia sesión
3. Ve a "API Keys" → "Create Key"
4. Copia la key que empieza con `sk-ant-api03-...`

### 5️⃣ Iniciar la Aplicación
```bash
npm start
```

Verás algo como:
```
═══════════════════════════════════════════════════════════════
   🚀 DESPEGA CONTENT STUDIO
   Generador de Carruseles con IA para Instagram
═══════════════════════════════════════════════════════════════

✅ Servidor corriendo en: http://localhost:3000
📝 System Prompt: Cargado ✅
🔑 API Key: Configurada ✅
```

### 6️⃣ Abrir en el Navegador
Abre tu navegador en: **http://localhost:3000**

---

## 🎯 Primeros Pasos

### Crear tu Primer Carrusel

1. **Sube una imagen**
   - Click en el área de upload
   - Elige una foto relacionada con tu tema
   - Máximo 10MB, JPG o PNG

2. **Escribe el tema**
   ```
   Ejemplo: "3 miedos que te frenan en Mercado Libre"
   ```

3. **Elige formato**
   - Cuadrado (1080x1080) - Para feed
   - Vertical (1080x1350) - Para stories
   - Horizontal (1080x566) - Landscape

4. **Selecciona estilo de copy**
   - Completo: Para posts detallados
   - Minimalista: Directo y corto
   - Educativo: Profundo con storytelling

5. **Generar**
   - Click en "Generar Carrusel con IA"
   - Espera 10-15 segundos
   - ¡Listo! 🎉

---

## 💡 Consejos Rápidos

### ✅ Buenos Temas para Probar
- "Errores comunes al vender en Mercado Libre"
- "Cómo configurar tu cuenta sin miedo"
- "3 ventajas de tu negocio físico vs grandes marcas"
- "Logística simplificada para principiantes"

### ❌ Evita
- Temas demasiado amplios: "Todo sobre ecommerce"
- Muy técnicos sin contexto: "API de Mercado Libre"
- Sin relación con tu audiencia

### 🔄 Regenerar Contenido
- ¿No te gustó un slide? → Click en "Regenerar este slide"
- ¿El copy necesita ajuste? → Click en "Regenerar Copy"
- Puedes regenerar cuantas veces quieras

---

## 🐛 Solución de Problemas Comunes

### "Cannot find module..."
```bash
# Borra node_modules y reinstala
rm -rf node_modules
npm install
```

### "API Key no configurada"
- Verifica que el archivo `.env` existe en la raíz
- Asegúrate de que dice `CLAUDE_API_KEY=` (sin espacios)
- Reinicia el servidor

### "Port 3000 is already in use"
```bash
# Cambia el puerto en .env
PORT=3001
```

### La imagen se ve pixelada
- Sube una imagen de mejor calidad
- Mínimo recomendado: 1080px de ancho

---

## 🎨 Personalización Rápida

### Cambiar la Firma
Edita `system-prompt-despega.md`, busca:
```
#DESPEGAconOdiley
```
Reemplaza por tu firma

### Cambiar Colores
Edita `public/styles.css`, busca:
```css
:root {
    --azul-confiable: #2C5F8D;
    --verde-oliva: #8B9D77;
    --crema-suave: #F5F0E8;
}
```

---

## 📞 ¿Necesitas Ayuda?

### Revisa:
1. README.md (documentación completa)
2. system-prompt-despega.md (configuración de IA)
3. Consola del navegador (F12) para errores

### Verifica:
- ✅ Node.js instalado (versión 18+)
- ✅ Dependencias instaladas (`npm install`)
- ✅ API Key configurada en `.env`
- ✅ Servidor corriendo (`npm start`)
- ✅ Puerto 3000 disponible

---

## 🚀 Siguiente Nivel

Una vez que domines lo básico:

1. **Personaliza el System Prompt**
   - Ajusta el tono de voz
   - Agrega tus propias frases ancla
   - Modifica la estructura de slides

2. **Deploya a la nube**
   - Railway, Vercel, o Heroku
   - Accede desde cualquier lugar
   - Comparte con tu equipo

3. **Crea tu biblioteca de carruseles**
   - Genera múltiples variaciones
   - Prueba diferentes formatos
   - Identifica qué funciona mejor

---

**¡Listo para crear contenido increíble! 🎉**

*DESPEGA Content Studio by Odiley Vargas | EME360PRO*
