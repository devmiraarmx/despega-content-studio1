/* ═════════════════════════════════════════════════════════════
   DESPEGA CONTENT STUDIO - JAVASCRIPT
   Con identidad EME360PRO y autenticación JWT
   Compatible con Vercel
   ═════════════════════════════════════════════════════════════ */

// Detectar entorno (desarrollo o producción)
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '';

// ═══════════════════════════════════════════════════════════════
// VERIFICAR AUTENTICACIÓN CON JWT AL CARGAR LA PÁGINA
// ═══════════════════════════════════════════════════════════════
(async function checkAuth() {
    const token = sessionStorage.getItem('auth_token');
    
    if (!token) {
        console.log('❌ No hay token, redirigiendo a login...');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/check-auth`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!data.authenticated) {
            console.log('❌ Token inválido, redirigiendo a login...');
            sessionStorage.clear();
            window.location.href = '/login.html';
        } else {
            console.log('✅ Usuario autenticado:', data.username);
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
})();

// Estado de la aplicación
const state = {
    imagenBase64: null,
    nombreImagen: null,
    carrusel: null,
    copy: null,
    slideActual: 0
};

// ═══════════════════════════════════════════════════════════════
// HELPER: Obtener headers con JWT
// ═══════════════════════════════════════════════════════════════
function getAuthHeaders() {
    const token = sessionStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Manejar errores 401 (token expirado)
// ═══════════════════════════════════════════════════════════════
function handleUnauthorized() {
    alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    sessionStorage.clear();
    window.location.href = '/login.html';
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 1: UPLOAD DE IMAGEN
// ═══════════════════════════════════════════════════════════════

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');
const btnRemoveImage = document.getElementById('btnRemoveImage');

// Click en la zona de upload
uploadZone.addEventListener('click', (e) => {
    if (e.target !== btnRemoveImage && !btnRemoveImage.contains(e.target)) {
        fileInput.click();
    }
});

// Drag & Drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#8B9D77';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '#2C5F8D';
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#2C5F8D';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageUpload(files[0]);
    }
});

// Cambio de archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
    }
});

// Remover imagen
btnRemoveImage.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUpload();
});

// Función para manejar el upload
function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor sube una imagen válida');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.imagenBase64 = e.target.result;
        state.nombreImagen = file.name;
        
        previewImage.src = e.target.result;
        uploadPlaceholder.style.display = 'none';
        uploadPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Reset upload
function resetUpload() {
    state.imagenBase64 = null;
    state.nombreImagen = null;
    fileInput.value = '';
    uploadPlaceholder.style.display = 'block';
    uploadPreview.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Fetch con timeout
// ═══════════════════════════════════════════════════════════════
async function fetchConTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('⏱️ La generación tardó demasiado. Intenta con un tema más simple.');
    }
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 2: GENERACIÓN DE CARRUSEL
// ═══════════════════════════════════════════════════════════════

const btnGenerar = document.getElementById('btnGenerar');
const creationSection = document.getElementById('creationSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');

btnGenerar.addEventListener('click', generarCarrusel);

async function generarCarrusel() {
    // Validaciones
    if (!state.imagenBase64) {
        alert('Por favor sube una imagen primero');
        return;
    }

    const tema = document.getElementById('tema').value.trim();
    if (!tema) {
        alert('Por favor describe el tema del carrusel');
        return;
    }

    const formato = document.querySelector('input[name="formato"]:checked')?.value;
    if (!formato) {
        alert('Por favor selecciona un formato');
        return;
    }

    const estiloCopy = document.querySelector('input[name="estilo_copy"]:checked')?.value;
    if (!estiloCopy) {
        alert('Por favor selecciona un estilo de copy');
        return;
    }

    // Mostrar loading
    creationSection.style.display = 'none';
    loadingSection.style.display = 'flex';
    resultsSection.style.display = 'none';

    // Animar progress steps
    animateLoadingSteps();

    try {
        const response = await fetchConTimeout(`${API_BASE_URL}/api/generar-carrusel`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tema: tema,
                estilo_copy: estiloCopy
            })
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detalles || 'Error al generar carrusel');
        }

        const data = await response.json();

        // Guardar en estado
        state.carrusel = data.carrusel;
        state.copy = data.copy_instagram;
        state.slideActual = 0;

        // Renderizar resultados
        renderizarCarrusel(formato);

        // Mostrar resultados
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';

    } catch (error) {
        console.error('Error completo:', error);

        // Mostrar error amigable
        let mensajeUsuario = '❌ Hubo un problema al generar el carrusel.\n\n';

        if (error.message && error.message.includes('JSON')) {
            mensajeUsuario += '🔄 La IA devolvió un formato inesperado.\n';
            mensajeUsuario += '💡 Solución: Intenta generar de nuevo.';
        } else if (error.message && error.message.includes('API')) {
            mensajeUsuario += '🌐 Problema de conexión con la IA.\n';
            mensajeUsuario += '💡 Solución: Verifica tu conexión e intenta en un momento.';
        } else {
            mensajeUsuario += `📝 Detalle: ${error.message}\n`;
            mensajeUsuario += '💡 Solución: Recarga la página e intenta nuevamente.';
        }

        alert(mensajeUsuario);

        loadingSection.style.display = 'none';
        creationSection.style.display = 'block';
    }
}

// Animar steps del loading
function animateLoadingSteps() {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => step.classList.remove('active'));

    steps[0].classList.add('active');
    setTimeout(() => {
        steps[1].classList.add('active');
    }, 1500);
    setTimeout(() => {
        steps[2].classList.add('active');
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 3: RENDERIZADO DE SLIDES
// ═══════════════════════════════════════════════════════════════

function renderizarCarrusel(formato) {
    const canvasContainer = document.getElementById('canvasContainer');
    const slidesContainer = document.getElementById('slidesContainer');
    const thumbnailsContainer = document.getElementById('thumbnails');
    const slideCounter = document.getElementById('slideCounter');
    const copyContent = document.getElementById('copyContent');

    // Limpiar
    slidesContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';

    // Aplicar formato
    canvasContainer.className = 'canvas-container';
    if (formato === 'stories') {
        canvasContainer.classList.add('formato-stories');
    } else if (formato === 'horizontal') {
        canvasContainer.classList.add('formato-horizontal');
    }

    // Renderizar cada slide
    state.carrusel.slides.forEach((slide, index) => {
        // Crear slide
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        slideDiv.dataset.index = index;
        if (index === 0) slideDiv.classList.add('active');

        if (slide.tipo === 'cierre') {
            // Slide 5 - Cierre
            slideDiv.innerHTML = `
                <div class="slide-cierre">
                    <div class="slide-title">${slide.titulo}</div>
                    <ul class="slide-list">
                        ${slide.puntos.map(p => `<li>${p.replace('✓', '').trim()}</li>`).join('')}
                    </ul>
                    ${slide.cta ? `<div class="slide-cta-text">${slide.cta}</div>` : ''}
                    <div class="slide-dm-btn">Envía DM 🚀</div>
                    <div class="slide-tag">${slide.firma || '#DESPEGAconOdiley'}</div>
                </div>
            `;
        } else {
            // Slides 1-4 - Con imagen de fondo
            slideDiv.innerHTML = `
                <img src="${state.imagenBase64}" alt="Background" class="slide-bg">
                <div class="slide-overlay">
                    <div class="slide-title">${slide.titulo}</div>
                    ${slide.texto ? `<div class="slide-text">${slide.texto}</div>` : ''}
                    ${slide.cta_button ? `<div class="slide-cta">${slide.cta_button}</div>` : ''}
                    <div class="slide-tag">#DESPEGAconOdiley</div>
                </div>
            `;
        }

        slidesContainer.appendChild(slideDiv);

        // Crear thumbnail
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.textContent = index + 1;
        if (index === 0) thumb.classList.add('active');
        thumb.addEventListener('click', () => cambiarSlide(index));
        thumbnailsContainer.appendChild(thumb);
    });

    // Actualizar contador
    slideCounter.textContent = `1 / ${state.carrusel.slides.length}`;

    // Renderizar copy
    copyContent.textContent = state.copy.contenido;
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 4: NAVEGACIÓN DE SLIDES
// ═══════════════════════════════════════════════════════════════

const btnPrevSlide = document.getElementById('btnPrevSlide');
const btnNextSlide = document.getElementById('btnNextSlide');

btnPrevSlide.addEventListener('click', () => {
    if (state.slideActual > 0) {
        cambiarSlide(state.slideActual - 1);
    }
});

btnNextSlide.addEventListener('click', () => {
    if (state.slideActual < state.carrusel.slides.length - 1) {
        cambiarSlide(state.slideActual + 1);
    }
});

function cambiarSlide(index) {
    state.slideActual = index;

    // Actualizar slides
    document.querySelectorAll('.slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    // Actualizar thumbnails
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });

    // Actualizar contador
    document.getElementById('slideCounter').textContent = 
        `${index + 1} / ${state.carrusel.slides.length}`;

    // Actualizar botones de navegación
    btnPrevSlide.disabled = index === 0;
    btnNextSlide.disabled = index === state.carrusel.slides.length - 1;
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 5: COPIAR COPY
// ═══════════════════════════════════════════════════════════════

const btnCopyCopy = document.getElementById('btnCopyCopy');

btnCopyCopy.addEventListener('click', async () => {
    const copyContent = document.getElementById('copyContent').textContent;
    
    try {
        await navigator.clipboard.writeText(copyContent);
        
        // Feedback visual
        const originalText = btnCopyCopy.innerHTML;
        btnCopyCopy.innerHTML = '✓ Copiado';
        btnCopyCopy.style.background = '#8B9D77';
        
        setTimeout(() => {
            btnCopyCopy.innerHTML = originalText;
            btnCopyCopy.style.background = '';
        }, 2000);
    } catch (err) {
        alert('Error al copiar. Intenta seleccionar y copiar manualmente.');
    }
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 6: REGENERAR SLIDE
// ═══════════════════════════════════════════════════════════════

const btnRegenerarSlide = document.getElementById('btnRegenerarSlide');

btnRegenerarSlide.addEventListener('click', async () => {
    const slideIndex = state.slideActual;
    const slideActualData = state.carrusel.slides[slideIndex];
    const tema = state.carrusel.tema;

    if (!confirm(`¿Regenerar el slide ${slideIndex + 1}?`)) return;

    btnRegenerarSlide.disabled = true;
    btnRegenerarSlide.textContent = 'Regenerando...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/regenerar-slide`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tema: tema,
                numero_slide: slideIndex + 1,
                slide_actual: slideActualData,
                contexto_carrusel: state.carrusel.slides
            })
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) throw new Error('Error al regenerar slide');

        const data = await response.json();
        
        // Actualizar estado
        state.carrusel.slides[slideIndex] = data.slide;
        
        // Re-renderizar
        const formato = document.querySelector('.canvas-container').classList.contains('formato-stories') 
            ? 'stories' 
            : document.querySelector('.canvas-container').classList.contains('formato-horizontal')
            ? 'horizontal'
            : 'cuadrado';
        renderizarCarrusel(formato);
        cambiarSlide(slideIndex);

        alert('Slide regenerado exitosamente');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al regenerar slide');
    } finally {
        btnRegenerarSlide.disabled = false;
        btnRegenerarSlide.innerHTML = '🔄 Regenerar Slide';
    }
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 7: REGENERAR COPY
// ═══════════════════════════════════════════════════════════════

const btnRegenerarCopy = document.getElementById('btnRegenerarCopy');

btnRegenerarCopy.addEventListener('click', async () => {
    const tema = state.carrusel.tema;
    const estiloCopy = state.copy.estilo;

    if (!confirm('¿Regenerar el copy de Instagram?')) return;

    btnRegenerarCopy.disabled = true;
    btnRegenerarCopy.textContent = 'Regenerando...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/regenerar-copy`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tema: tema,
                estilo_copy: estiloCopy,
                slides_del_carrusel: state.carrusel.slides
            })
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) throw new Error('Error al regenerar copy');

        const data = await response.json();
        
        // Actualizar estado
        state.copy = data.copy_instagram;
        
        // Actualizar UI
        document.getElementById('copyContent').textContent = state.copy.contenido;

        alert('Copy regenerado exitosamente');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al regenerar copy');
    } finally {
        btnRegenerarCopy.disabled = false;
        btnRegenerarCopy.innerHTML = '🔄 Regenerar Copy';
    }
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 8: DESCARGAR CARRUSEL
// ═══════════════════════════════════════════════════════════════

const btnDescargar = document.getElementById('btnDescargar');

btnDescargar.addEventListener('click', async () => {
    btnDescargar.disabled = true;
    btnDescargar.textContent = 'Generando archivos...';

    try {
        // Importar html2canvas dinámicamente
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }

        const tema = state.carrusel.tema;
        const fecha = new Date().toISOString().split('T')[0];
        const slides = document.querySelectorAll('.slide');

        for (let i = 0; i < slides.length; i++) {
            // Hacer visible el slide
            slides.forEach(s => s.classList.remove('active'));
            slides[i].classList.add('active');
            
            // Esperar un momento para que se renderice
            await new Promise(resolve => setTimeout(resolve, 300));

            // Capturar
            const canvas = await html2canvas(slides[i], {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true
            });

            // Descargar
            const link = document.createElement('a');
            link.download = `${tema} - ${fecha} - Slide ${i + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Pequeña pausa entre descargas
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Restaurar vista
        cambiarSlide(state.slideActual);
        alert('¡Carrusel descargado exitosamente!');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al descargar. Asegúrate de tener conexión a internet.');
    } finally {
        btnDescargar.disabled = false;
        btnDescargar.innerHTML = '⬇️ Descargar Carrusel';
    }
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 9: NUEVO CARRUSEL
// ═══════════════════════════════════════════════════════════════

const btnNuevoCarrusel = document.getElementById('btnNuevoCarrusel');

btnNuevoCarrusel.addEventListener('click', () => {
    if (confirm('¿Crear un nuevo carrusel? Se perderá el actual.')) {
        // Reset completo
        state.carrusel = null;
        state.copy = null;
        state.slideActual = 0;
        
        // Reset form
        document.getElementById('tema').value = '';
        document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        
        // Mostrar creación
        resultsSection.style.display = 'none';
        creationSection.style.display = 'block';
    }
});

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

console.log('✅ DESPEGA Content Studio cargado');
console.log('💙 Con identidad EME360PRO');
console.log('🔐 Sistema de autenticación JWT activado');
console.log(`🌐 API Base URL: ${API_BASE_URL || 'Producción (mismo dominio)'}`);