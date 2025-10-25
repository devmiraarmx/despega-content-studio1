// ═══════════════════════════════════════════════════════════════════════════════
// DESPEGA CONTENT STUDIO - SERVER CON JWT
// Generador de Carruseles con IA para Instagram
// By: Odiley Vargas - EME360PRO
// Optimizado para Vercel Serverless con JWT Authentication
// ═══════════════════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// Configuración de rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// ═══════════════════════════════════════════════════════════════
// HELPER: Extraer JSON limpio de respuesta de Claude
// ═══════════════════════════════════════════════════════════════
function extraerJSON(contenido) {
  try {
    // Intento 1: Parsear directamente
    return JSON.parse(contenido);
  } catch (e) {
    // Intento 2: Buscar JSON entre marcadores de código
    const codeBlockMatch = contenido.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (e2) {}
    }

    // Intento 3: Buscar primer objeto JSON válido
    const jsonMatch = contenido.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e3) {}
    }

    // Intento 4: Limpiar texto antes/después y parsear
    const limpio = contenido
      .replace(/^[^{]*/, '') // Quitar texto antes del primer {
      .replace(/[^}]*$/, ''); // Quitar texto después del último }

    try {
      return JSON.parse(limpio);
    } catch (e4) {
      throw new Error('No se pudo extraer JSON válido');
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Cargar el System Prompt desde archivo
const systemPromptPath = path.join(__dirname, 'system-prompt-despega.md');
let SYSTEM_PROMPT = '';

try {
  SYSTEM_PROMPT = fs.readFileSync(systemPromptPath, 'utf8');
  console.log('✅ System Prompt cargado correctamente');
} catch (error) {
  console.error('❌ Error al cargar System Prompt:', error.message);
  SYSTEM_PROMPT = 'Eres un experto en crear contenido para Instagram especializado en Mercado Libre.';
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: Verificar JWT Token
// ═══════════════════════════════════════════════════════════════════════════════
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autenticado',
      detalles: 'Token no proporcionado'
    });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido',
      detalles: 'Tu sesión ha expirado. Inicia sesión nuevamente.'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Login
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.LOGIN_USERNAME || 'admin';
  const validPassword = process.env.LOGIN_PASSWORD || 'despega2024';

  if (username === validUsername && password === validPassword) {
    // Crear JWT token válido por 24 horas
    const token = jwt.sign(
      { 
        username: username,
        loginTime: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Login exitoso para: ${username}`);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      username: username
    });
  } else {
    console.log(`❌ Login fallido para: ${username}`);
    res.status(401).json({
      error: 'Credenciales inválidas',
      detalles: 'Usuario o contraseña incorrectos'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Verificar autenticación
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/check-auth', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      authenticated: true,
      username: decoded.username
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Logout
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/logout', (req, res) => {
  // Con JWT, el logout es manejado en el cliente (eliminar token)
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Servir archivos estáticos
// ═══════════════════════════════════════════════════════════════════════════════
app.use(express.static('public'));

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Generar Carrusel Completo (PROTEGIDO CON JWT)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/generar-carrusel', requireAuth, async (req, res) => {
  try {
    const { tema, estilo_copy } = req.body;

    // Validaciones
    if (!tema || tema.trim() === '') {
      return res.status(400).json({
        error: 'El tema es requerido',
        detalles: 'Debes proporcionar un tema para el carrusel'
      });
    }

    if (!estilo_copy || !['completo', 'minimalista', 'educativo'].includes(estilo_copy)) {
      return res.status(400).json({
        error: 'Estilo de copy inválido',
        detalles: 'Elige entre: completo, minimalista, educativo'
      });
    }

    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: 'API Key no configurada',
        detalles: 'Configura CLAUDE_API_KEY en el archivo .env'
      });
    }

    console.log(`\n🎨 Generando carrusel sobre: "${tema}"`);
    console.log(`📝 Estilo de copy: ${estilo_copy}`);
    console.log(`👤 Usuario: ${req.user.username}`);

    const userPrompt = `
Genera un carrusel completo de 5 slides sobre el siguiente tema:

TEMA: ${tema}

ESTILO DE COPY: ${estilo_copy}

INSTRUCCIONES:
1. Analiza el tema y estructura el contenido según los principios del Método DESPEGA
2. Crea 5 slides optimizados (4 con contenido + 1 de cierre)
3. Genera el copy de Instagram en el estilo "${estilo_copy}"
4. Asegúrate de incluir al menos una frase ancla de EME360PRO
5. Mantén el tono empático y claro, sin tecnicismos
6. Conecta el contenido con la audiencia de microempresarios en Mercado Libre

Responde ÚNICAMENTE con el JSON en el formato especificado en el system prompt, sin texto adicional antes o después.

CRÍTICO: Tu respuesta debe ser ÚNICAMENTE el objeto JSON, sin ningún texto adicional antes ni después. No incluyas explicaciones, comentarios, ni bloques de código markdown. Solo el JSON puro empezando con { y terminando con }.
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Claude API:', errorData);
      return res.status(response.status).json({
        error: 'Error al comunicarse con Claude API',
        detalles: errorData.error?.message || 'Error desconocido'
      });
    }

    const data = await response.json();
    const contenidoGenerado = data.content[0].text;

    // Log para debugging
    console.log('📊 Respuesta de Claude (primeros 300 chars):', contenidoGenerado.substring(0, 300));
    console.log('📊 Longitud total:', contenidoGenerado.length);
    console.log('📊 Primeros 50 chars:', contenidoGenerado.substring(0, 50));
    console.log('📊 Últimos 50 chars:', contenidoGenerado.substring(contenidoGenerado.length - 50));

    let carruselData;
    try {
      carruselData = extraerJSON(contenidoGenerado);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      console.error('📄 Contenido recibido:', contenidoGenerado.substring(0, 500));
      return res.status(500).json({
        error: 'Error al procesar la respuesta de la IA',
        detalles: 'La respuesta no está en formato JSON válido',
        contenido_preview: contenidoGenerado.substring(0, 200)
      });
    }

    console.log('✅ Carrusel generado exitosamente');
    
    res.json({
      success: true,
      carrusel: carruselData.carrusel,
      copy_instagram: carruselData.copy_instagram,
      tema_procesado: tema,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error completo:', error);

    // Error específico de la API de Claude
    if (error.message && error.message.includes('API')) {
      return res.status(503).json({
        error: 'Error de comunicación con la IA',
        detalles: 'No se pudo conectar con Claude API. Verifica tu API Key y conexión.',
        sugerencia: 'Intenta nuevamente en unos segundos'
      });
    }

    // Error de parsing
    if (error.message && error.message.includes('JSON')) {
      return res.status(500).json({
        error: 'Error al procesar contenido',
        detalles: 'La IA generó contenido en formato incorrecto. Intenta regenerar.',
        sugerencia: 'Click en "Regenerar" para intentar de nuevo'
      });
    }

    // Error genérico
    res.status(500).json({
      error: 'Error inesperado',
      detalles: error.message || 'Error desconocido',
      sugerencia: 'Recarga la página e intenta nuevamente'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Regenerar Slide Individual (PROTEGIDO CON JWT)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/regenerar-slide', requireAuth, async (req, res) => {
  try {
    const { tema, numero_slide, slide_actual, contexto_carrusel } = req.body;

    if (!tema || !numero_slide) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        detalles: 'Se requiere tema y numero_slide'
      });
    }

    console.log(`\n🔄 Regenerando slide ${numero_slide} sobre: "${tema}"`);
    console.log(`👤 Usuario: ${req.user.username}`);

    const userPrompt = `
Regenera el slide número ${numero_slide} del carrusel sobre: "${tema}"

CONTEXTO DEL CARRUSEL:
${contexto_carrusel ? JSON.stringify(contexto_carrusel, null, 2) : 'No disponible'}

SLIDE ACTUAL QUE SE REGENERARÁ:
${slide_actual ? JSON.stringify(slide_actual, null, 2) : 'No disponible'}

INSTRUCCIONES:
- Genera una variación diferente pero manteniendo la esencia del tema
- Mantén el formato JSON igual
- Asegúrate de que fluya bien con el resto del carrusel
- Mantén el tono de marca EME360PRO

Responde ÚNICAMENTE con el JSON del slide, sin texto adicional:
{
  "numero": ${numero_slide},
  "tipo": "...",
  "titulo": "...",
  "texto": "..." o "puntos": [...] para slide 5
}

CRÍTICO: Tu respuesta debe ser ÚNICAMENTE el objeto JSON, sin ningún texto adicional antes ni después. No incluyas explicaciones, comentarios, ni bloques de código markdown. Solo el JSON puro empezando con { y terminando con }.
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: 'Error al regenerar slide',
        detalles: errorData.error?.message || 'Error desconocido'
      });
    }

    const data = await response.json();
    const contenidoGenerado = data.content[0].text;

    // Log para debugging
    console.log('📊 Respuesta de Claude (primeros 300 chars):', contenidoGenerado.substring(0, 300));
    console.log('📊 Longitud total:', contenidoGenerado.length);
    console.log('📊 Primeros 50 chars:', contenidoGenerado.substring(0, 50));
    console.log('📊 Últimos 50 chars:', contenidoGenerado.substring(contenidoGenerado.length - 50));

    let slideData;
    try {
      slideData = extraerJSON(contenidoGenerado);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      console.error('📄 Contenido recibido:', contenidoGenerado.substring(0, 500));
      return res.status(500).json({
        error: 'Error al procesar la respuesta de la IA',
        detalles: 'La respuesta no está en formato JSON válido',
        contenido_preview: contenidoGenerado.substring(0, 200)
      });
    }

    console.log(`✅ Slide ${numero_slide} regenerado exitosamente`);
    
    res.json({
      success: true,
      slide: slideData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error completo:', error);

    // Error específico de la API de Claude
    if (error.message && error.message.includes('API')) {
      return res.status(503).json({
        error: 'Error de comunicación con la IA',
        detalles: 'No se pudo conectar con Claude API. Verifica tu API Key y conexión.',
        sugerencia: 'Intenta nuevamente en unos segundos'
      });
    }

    // Error de parsing
    if (error.message && error.message.includes('JSON')) {
      return res.status(500).json({
        error: 'Error al procesar contenido',
        detalles: 'La IA generó contenido en formato incorrecto. Intenta regenerar.',
        sugerencia: 'Click en "Regenerar" para intentar de nuevo'
      });
    }

    // Error genérico
    res.status(500).json({
      error: 'Error inesperado',
      detalles: error.message || 'Error desconocido',
      sugerencia: 'Recarga la página e intenta nuevamente'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Regenerar Copy de Instagram (PROTEGIDO CON JWT)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/regenerar-copy', requireAuth, async (req, res) => {
  try {
    const { tema, estilo_copy, slides_del_carrusel } = req.body;

    if (!tema || !estilo_copy) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        detalles: 'Se requiere tema y estilo_copy'
      });
    }

    console.log(`\n🔄 Regenerando copy (${estilo_copy}) sobre: "${tema}"`);
    console.log(`👤 Usuario: ${req.user.username}`);

    const userPrompt = `
Regenera el copy de Instagram sobre: "${tema}"

ESTILO SOLICITADO: ${estilo_copy}

SLIDES DEL CARRUSEL:
${slides_del_carrusel ? JSON.stringify(slides_del_carrusel, null, 2) : 'No disponible'}

INSTRUCCIONES:
- Genera una variación diferente del copy en estilo "${estilo_copy}"
- Mantén coherencia con los slides del carrusel
- Incluye emojis, hashtags y estructura según el estilo
- Mantén tono de marca EME360PRO

Responde ÚNICAMENTE con el JSON del copy, sin texto adicional:
{
  "estilo": "${estilo_copy}",
  "contenido": "Copy completo aquí..."
}

CRÍTICO: Tu respuesta debe ser ÚNICAMENTE el objeto JSON, sin ningún texto adicional antes ni después. No incluyas explicaciones, comentarios, ni bloques de código markdown. Solo el JSON puro empezando con { y terminando con }.
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: 'Error al regenerar copy',
        detalles: errorData.error?.message || 'Error desconocido'
      });
    }

    const data = await response.json();
    const contenidoGenerado = data.content[0].text;

    // Log para debugging
    console.log('📊 Respuesta de Claude (primeros 300 chars):', contenidoGenerado.substring(0, 300));
    console.log('📊 Longitud total:', contenidoGenerado.length);
    console.log('📊 Primeros 50 chars:', contenidoGenerado.substring(0, 50));
    console.log('📊 Últimos 50 chars:', contenidoGenerado.substring(contenidoGenerado.length - 50));

    let copyData;
    try {
      copyData = extraerJSON(contenidoGenerado);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      console.error('📄 Contenido recibido:', contenidoGenerado.substring(0, 500));
      return res.status(500).json({
        error: 'Error al procesar la respuesta de la IA',
        detalles: 'La respuesta no está en formato JSON válido',
        contenido_preview: contenidoGenerado.substring(0, 200)
      });
    }

    console.log('✅ Copy regenerado exitosamente');
    
    res.json({
      success: true,
      copy_instagram: copyData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error completo:', error);

    // Error específico de la API de Claude
    if (error.message && error.message.includes('API')) {
      return res.status(503).json({
        error: 'Error de comunicación con la IA',
        detalles: 'No se pudo conectar con Claude API. Verifica tu API Key y conexión.',
        sugerencia: 'Intenta nuevamente en unos segundos'
      });
    }

    // Error de parsing
    if (error.message && error.message.includes('JSON')) {
      return res.status(500).json({
        error: 'Error al procesar contenido',
        detalles: 'La IA generó contenido en formato incorrecto. Intenta regenerar.',
        sugerencia: 'Click en "Regenerar" para intentar de nuevo'
      });
    }

    // Error genérico
    res.status(500).json({
      error: 'Error inesperado',
      detalles: error.message || 'Error desconocido',
      sugerencia: 'Recarga la página e intenta nuevamente'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Health Check
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'DESPEGA Content Studio',
    version: '1.0.1-jwt',
    system_prompt_loaded: SYSTEM_PROMPT.length > 100,
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Servidor - Solo para desarrollo local
// ═══════════════════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   🚀 DESPEGA CONTENT STUDIO');
    console.log('   Generador de Carruseles con IA para Instagram');
    console.log('   🔐 Con autenticación JWT');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📝 System Prompt: ${SYSTEM_PROMPT.length > 100 ? 'Cargado ✅' : 'No cargado ❌'}`);
    console.log(`🔑 API Key: ${process.env.CLAUDE_API_KEY ? 'Configurada ✅' : 'Falta configurar ❌'}`);
    console.log(`👤 Login: ${process.env.LOGIN_USERNAME || 'admin'} / ${process.env.LOGIN_PASSWORD ? '***' : 'despega2024'}`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configurado ✅' : 'Usando default ⚠️'}`);
    console.log('\n═══════════════════════════════════════════════════════════════\n');
  });
}

export default app;