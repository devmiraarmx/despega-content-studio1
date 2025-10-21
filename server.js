// ═══════════════════════════════════════════════════════════════════════════════
// DESPEGA CONTENT STUDIO - SERVER
// Generador de Carruseles con IA para Instagram
// By: Odiley Vargas - EME360PRO
// Compatible con Vercel Serverless + Login
// ═══════════════════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import session from 'express-session';

// Configuración de rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Session middleware - Configuración optimizada para Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'despega-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Siempre true porque Vercel usa HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax' // Importante para Vercel
  }
}));

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
// MIDDLEWARE: Verificar autenticación
// ═══════════════════════════════════════════════════════════════════════════════
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  
  // Si es una petición API, devolver 401
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      error: 'No autenticado',
      detalles: 'Debes iniciar sesión para acceder a esta funcionalidad'
    });
  }
  
  // Si es página HTML, redirigir a login
  res.redirect('/login.html');
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Login
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.LOGIN_USERNAME || 'admin';
  const validPassword = process.env.LOGIN_PASSWORD || 'despega2024';

  if (username === validUsername && password === validPassword) {
    req.session.authenticated = true;
    req.session.username = username;
    
    // Guardar la sesión explícitamente
    req.session.save((err) => {
      if (err) {
        console.error('Error al guardar sesión:', err);
        return res.status(500).json({
          error: 'Error al crear sesión'
        });
      }
      
      res.json({
        success: true,
        message: 'Login exitoso',
        username: username
      });
    });
  } else {
    res.status(401).json({
      error: 'Credenciales inválidas',
      detalles: 'Usuario o contraseña incorrectos'
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Logout
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Error al cerrar sesión'
      });
    }
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Verificar sesión
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/check-auth', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({
      authenticated: true,
      username: req.session.username
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Servir archivos estáticos públicos (login.html, login.js, login.css)
// ═══════════════════════════════════════════════════════════════════════════════
app.use('/login.html', express.static(path.join(__dirname, 'public', 'login.html')));
app.use('/login.js', express.static(path.join(__dirname, 'public', 'login.js')));
app.use('/login.css', express.static(path.join(__dirname, 'public', 'login.css')));
app.use('/styles.css', express.static(path.join(__dirname, 'public', 'styles.css')));

// ═══════════════════════════════════════════════════════════════════════════════
// Proteger la app principal con autenticación
// ═══════════════════════════════════════════════════════════════════════════════
app.use('/', (req, res, next) => {
  // Permitir acceso a login sin autenticación
  if (req.path === '/login.html' || req.path === '/login.js' || req.path === '/login.css' || req.path === '/styles.css' || req.path.startsWith('/api/login') || req.path === '/api/check-auth') {
    return next();
  }
  
  // Proteger todo lo demás
  requireAuth(req, res, next);
});

app.use(express.static('public'));

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Generar Carrusel Completo (PROTEGIDO)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/generar-carrusel', requireAuth, async (req, res) => {
  try {
    const { tema, estilo_copy } = req.body;

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
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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

    console.log('✅ Respuesta de Claude recibida');

    let carruselData;
    try {
      const jsonMatch = contenidoGenerado.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        carruselData = JSON.parse(jsonMatch[0]);
      } else {
        carruselData = JSON.parse(contenidoGenerado);
      }
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      return res.status(500).json({
        error: 'Error al procesar la respuesta de la IA',
        detalles: 'La respuesta no está en formato JSON válido',
        contenido_raw: contenidoGenerado
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
    console.error('❌ Error general:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalles: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Regenerar Slide Individual (PROTEGIDO)
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
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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

    let slideData;
    try {
      const jsonMatch = contenidoGenerado.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        slideData = JSON.parse(jsonMatch[0]);
      } else {
        slideData = JSON.parse(contenidoGenerado);
      }
    } catch (parseError) {
      return res.status(500).json({
        error: 'Error al procesar slide regenerado',
        contenido_raw: contenidoGenerado
      });
    }

    console.log(`✅ Slide ${numero_slide} regenerado exitosamente`);
    
    res.json({
      success: true,
      slide: slideData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al regenerar slide:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalles: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: Regenerar Copy de Instagram (PROTEGIDO)
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
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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

    let copyData;
    try {
      const jsonMatch = contenidoGenerado.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        copyData = JSON.parse(jsonMatch[0]);
      } else {
        copyData = JSON.parse(contenidoGenerado);
      }
    } catch (parseError) {
      return res.status(500).json({
        error: 'Error al procesar copy regenerado',
        contenido_raw: contenidoGenerado
      });
    }

    console.log('✅ Copy regenerado exitosamente');
    
    res.json({
      success: true,
      copy_instagram: copyData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al regenerar copy:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalles: error.message
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
    version: '1.0.0',
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
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📝 System Prompt: ${SYSTEM_PROMPT.length > 100 ? 'Cargado ✅' : 'No cargado ❌'}`);
    console.log(`🔑 API Key: ${process.env.CLAUDE_API_KEY ? 'Configurada ✅' : 'Falta configurar ❌'}`);
    console.log(`👤 Login: ${process.env.LOGIN_USERNAME || 'admin'} / ${process.env.LOGIN_PASSWORD ? '***' : 'despega2024'}`);
    console.log('\n═══════════════════════════════════════════════════════════════\n');
  });
}

export default app;