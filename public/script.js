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
    slideActual: 0,
    preferencias: {
        tipografia: 'clasico',
        overlayColor: '#2C5F8D',
        overlayOpacity: 0.7,
        overlayPorSlide: {} // { slideIndex: { enabled: true, color: '#...', opacity: 0.7 } }
    }
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
        const response = await fetch(`${API_BASE_URL}/api/generar-carrusel`, {
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

        // Cargar preferencias guardadas
        cargarPreferencias();

        // Renderizar resultados
        renderizarCarrusel(formato);
        
        // Mostrar resultados
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
        loadingSection.style.display = 'none';
        creationSection.style.display = 'block';
    }
}

// Animar steps del loading
function animateLoadingSteps() {
    const steps = document.querySelectorAll('.progress-step');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 3: RENDERIZAR CARRUSEL
// ═══════════════════════════════════════════════════════════════

function renderizarCarrusel(formato) {
    const container = document.querySelector('.canvas-container');
    const copyContent = document.getElementById('copyContent');
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Aplicar clase de formato
    container.className = 'canvas-container';
    if (formato === 'stories') {
        container.classList.add('formato-stories');
    } else if (formato === 'horizontal') {
        container.classList.add('formato-horizontal');
    } else {
        container.classList.add('formato-cuadrado');
    }
    
    // Renderizar slides
    state.carrusel.slides.forEach((slide, index) => {
        const slideElement = crearSlideElement(slide, index, formato);
        container.appendChild(slideElement);
    });
    
    // Actualizar copy
    copyContent.textContent = state.copy.contenido;
    
    // Mostrar primer slide
    cambiarSlide(0);
}

function crearSlideElement(slide, index, formato) {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';
    slideDiv.dataset.index = index;
    
    // Aplicar tipografía seleccionada
    const tipografiaClass = `tipografia-${state.preferencias.tipografia}`;
    slideDiv.classList.add(tipografiaClass);
    
    // SLIDE 5 ESPECIAL (índice 4): Sin imagen, fondo crema, formato resumen
    if (index === 4) {
        slideDiv.classList.add('slide-resumen');
        
        // Parsear puntos del texto de forma segura
        let puntosHTML = '';
        if (slide.texto && typeof slide.texto === 'string') {
            const puntos = slide.texto.split('\n').filter(p => p.trim().length > 0).slice(0, 3);
            puntosHTML = puntos.map(punto => `
                <div class="punto-resumen">✓ ${punto.replace(/^[•\-\*]\s*/, '')}</div>
            `).join('');
        } else if (slide.puntos && Array.isArray(slide.puntos)) {
            // Si la IA genera un array de puntos
            puntosHTML = slide.puntos.slice(0, 3).map(punto => `
                <div class="punto-resumen">✓ ${punto}</div>
            `).join('');
        } else {
            // Fallback: puntos por defecto
            puntosHTML = `
                <div class="punto-resumen">✓ Sistema paso a paso probado</div>
                <div class="punto-resumen">✓ Acompañamiento personalizado</div>
                <div class="punto-resumen">✓ Sin riesgos ni complicaciones</div>
            `;
        }
        
        slideDiv.innerHTML = `
            <div class="slide-content-resumen">
                <h2 class="slide-title">${slide.titulo || 'De tu local a todo México'}</h2>
                <div class="puntos-container">
                    ${puntosHTML}
                </div>
                <p class="slide-pregunta">${slide.pregunta || '¿Listo para DESPEGAR? Escríbeme por DM 📩'}</p>
                <div class="slide-cta">${slide.cta || 'Envía DM 🚀'}</div>
            </div>
            <div class="slide-hashtag">#DESPEGAconODILEY🚀</div>
        `;
    } else {
        // SLIDES 1-4 NORMALES: Con imagen + overlay
        const overlayConfig = state.preferencias.overlayPorSlide[index] || {
            enabled: true,
            color: state.preferencias.overlayColor,
            opacity: state.preferencias.overlayOpacity
        };
        
        slideDiv.innerHTML = `
            <img src="${state.imagenBase64}" alt="Fondo" class="slide-background">
            ${overlayConfig.enabled ? `
                <div class="slide-overlay" style="background-color: ${overlayConfig.color}; opacity: ${overlayConfig.opacity};"></div>
            ` : ''}
            <div class="slide-content">
                <h2 class="slide-title">${slide.titulo}</h2>
                <p class="slide-text">${slide.texto}</p>
                ${slide.cta_button ? `<div class="slide-cta">${slide.cta_button}</div>` : '<div class="slide-cta">Envía DM 🚀</div>'}
            </div>
            <div class="slide-number">${index + 1}/${state.carrusel.slides.length}</div>
            <div class="slide-hashtag">#DESPEGAconODILEY🚀</div>
        `;
    }
    
    return slideDiv;
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
    
    // Actualizar slides visibles
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
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

            // Obtener el ancho real del slide para calcular el scale correcto
            const slideWidth = slides[i].offsetWidth;
            const targetWidth = 1080; // Ancho deseado siempre
            const scale = targetWidth / slideWidth; // Calcular scale dinámico

            // Capturar con scale preciso para obtener exactamente 1080px de ancho
            const canvas = await html2canvas(slides[i], {
                scale: scale,
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
// SECCIÓN 10: MODAL DE EDICIÓN
// ═══════════════════════════════════════════════════════════════

const btnEditarDiseno = document.getElementById('btnEditarDiseno');
const editModal = document.getElementById('editModal');
const btnCloseModal = document.getElementById('btnCloseModal');

// Abrir modal
btnEditarDiseno.addEventListener('click', () => {
    editModal.classList.add('active');
    actualizarModalConSlideActual();
});

// Cerrar modal
btnCloseModal.addEventListener('click', () => {
    editModal.classList.remove('active');
});

// Cerrar al hacer click fuera
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.classList.remove('active');
    }
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 11: TABS DEL MODAL
// ═══════════════════════════════════════════════════════════════

const tabButtons = document.querySelectorAll('.modal-tab');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        // Actualizar botones
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Actualizar panes
        tabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 12: SELECTOR DE TIPOGRAFÍA
// ═══════════════════════════════════════════════════════════════

const tipografiaOptions = document.querySelectorAll('.tipografia-option');

tipografiaOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Actualizar selección visual
        tipografiaOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Guardar en estado
        state.preferencias.tipografia = option.dataset.tipografia;
        
        // Aplicar a todos los slides
        aplicarTipografiaATodos();
        
        // Guardar preferencias
        guardarPreferencias();
    });
});

function aplicarTipografiaATodos() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        // Remover todas las clases de tipografía
        slide.classList.remove('tipografia-clasico', 'tipografia-moderno', 'tipografia-bold', 'tipografia-elegante', 'tipografia-tech');
        // Agregar la nueva
        slide.classList.add(`tipografia-${state.preferencias.tipografia}`);
    });
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 13: EDITOR DE COLOR DE OVERLAY
// ═══════════════════════════════════════════════════════════════

const overlayColorPicker = document.getElementById('overlayColorPicker');
const overlayOpacitySlider = document.getElementById('overlayOpacitySlider');
const overlayOpacityValue = document.getElementById('overlayOpacityValue');
const overlayToggle = document.getElementById('overlayToggle');
const aplicarATodosBtn = document.getElementById('aplicarATodos');

// Color picker
overlayColorPicker.addEventListener('input', (e) => {
    const slideIndex = state.slideActual;
    
    if (!state.preferencias.overlayPorSlide[slideIndex]) {
        state.preferencias.overlayPorSlide[slideIndex] = {
            enabled: true,
            color: state.preferencias.overlayColor,
            opacity: state.preferencias.overlayOpacity
        };
    }
    
    state.preferencias.overlayPorSlide[slideIndex].color = e.target.value;
    aplicarOverlayAlSlideActual();
    guardarPreferencias();
});

// Opacity slider
overlayOpacitySlider.addEventListener('input', (e) => {
    const slideIndex = state.slideActual;
    const opacity = parseFloat(e.target.value);
    
    overlayOpacityValue.textContent = `${Math.round(opacity * 100)}%`;
    
    if (!state.preferencias.overlayPorSlide[slideIndex]) {
        state.preferencias.overlayPorSlide[slideIndex] = {
            enabled: true,
            color: state.preferencias.overlayColor,
            opacity: state.preferencias.overlayOpacity
        };
    }
    
    state.preferencias.overlayPorSlide[slideIndex].opacity = opacity;
    aplicarOverlayAlSlideActual();
    guardarPreferencias();
});

// Toggle overlay
overlayToggle.addEventListener('change', (e) => {
    const slideIndex = state.slideActual;
    const enabled = e.target.checked;
    
    if (!state.preferencias.overlayPorSlide[slideIndex]) {
        state.preferencias.overlayPorSlide[slideIndex] = {
            enabled: true,
            color: state.preferencias.overlayColor,
            opacity: state.preferencias.overlayOpacity
        };
    }
    
    state.preferencias.overlayPorSlide[slideIndex].enabled = enabled;
    aplicarOverlayAlSlideActual();
    guardarPreferencias();
});

// Aplicar a todos los slides
aplicarATodosBtn.addEventListener('click', () => {
    if (!confirm('¿Aplicar esta configuración de overlay a todos los slides?')) return;
    
    const slideIndex = state.slideActual;
    const config = state.preferencias.overlayPorSlide[slideIndex] || {
        enabled: true,
        color: state.preferencias.overlayColor,
        opacity: state.preferencias.overlayOpacity
    };
    
    // Aplicar a todos
    state.carrusel.slides.forEach((_, index) => {
        state.preferencias.overlayPorSlide[index] = { ...config };
    });
    
    // Actualizar preferencias globales
    state.preferencias.overlayColor = config.color;
    state.preferencias.overlayOpacity = config.opacity;
    
    // Re-renderizar
    const formato = document.querySelector('.canvas-container').classList.contains('formato-stories') 
        ? 'stories' 
        : document.querySelector('.canvas-container').classList.contains('formato-horizontal')
        ? 'horizontal'
        : 'cuadrado';
    renderizarCarrusel(formato);
    cambiarSlide(state.slideActual);
    
    guardarPreferencias();
});

function aplicarOverlayAlSlideActual() {
    const slideIndex = state.slideActual;
    const slideElement = document.querySelector(`.slide[data-index="${slideIndex}"]`);
    if (!slideElement) return;
    
    const config = state.preferencias.overlayPorSlide[slideIndex];
    let overlay = slideElement.querySelector('.slide-overlay');
    
    if (config.enabled) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'slide-overlay';
            slideElement.insertBefore(overlay, slideElement.querySelector('.slide-content'));
        }
        overlay.style.backgroundColor = config.color;
        overlay.style.opacity = config.opacity;
    } else {
        if (overlay) {
            overlay.remove();
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 14: EDICIÓN DE CONTENIDO DE TEXTO
// ═══════════════════════════════════════════════════════════════

const editTituloInput = document.getElementById('editTitulo');
const editTextoInput = document.getElementById('editTexto');
const editCtaInput = document.getElementById('editCta');
const btnGuardarCambios = document.getElementById('btnGuardarCambios');

// Guardar cambios de texto
btnGuardarCambios.addEventListener('click', () => {
    const slideIndex = state.slideActual;
    
    // Actualizar estado
    state.carrusel.slides[slideIndex].titulo = editTituloInput.value;
    state.carrusel.slides[slideIndex].texto = editTextoInput.value;
    
    // Slides 1-4 usan cta_button, Slide 5 usa cta
    if (slideIndex < 4) {
        state.carrusel.slides[slideIndex].cta_button = editCtaInput.value;
    } else {
        state.carrusel.slides[slideIndex].cta = editCtaInput.value;
    }
    
    // Actualizar slide visual
    const slideElement = document.querySelector(`.slide[data-index="${slideIndex}"]`);
    if (slideElement) {
        slideElement.querySelector('.slide-title').textContent = editTituloInput.value;
        slideElement.querySelector('.slide-text').textContent = editTextoInput.value;
        
        const ctaElement = slideElement.querySelector('.slide-cta');
        const ctaValue = editCtaInput.value || 'Envía DM 🚀'; // CTA por defecto
        if (ctaElement) {
            ctaElement.textContent = ctaValue;
        } else {
            const newCta = document.createElement('div');
            newCta.className = 'slide-cta';
            newCta.textContent = ctaValue;
            slideElement.querySelector('.slide-content').appendChild(newCta);
        }
    }
    
    // Feedback visual
    const originalText = btnGuardarCambios.textContent;
    btnGuardarCambios.textContent = '✓ Guardado';
    btnGuardarCambios.style.background = '#8B9D77';
    
    setTimeout(() => {
        btnGuardarCambios.textContent = originalText;
        btnGuardarCambios.style.background = '';
    }, 2000);
});

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 15: ACTUALIZAR MODAL AL CAMBIAR SLIDE
// ═══════════════════════════════════════════════════════════════

function actualizarModalConSlideActual() {
    const slideIndex = state.slideActual;
    const slide = state.carrusel.slides[slideIndex];
    
    // Actualizar tab de contenido
    editTituloInput.value = slide.titulo;
    editTextoInput.value = slide.texto;
    
    // Slides 1-4 usan cta_button, Slide 5 usa cta
    if (slideIndex < 4) {
        editCtaInput.value = slide.cta_button || '';
    } else {
        editCtaInput.value = slide.cta || '';
    }
    
    // Actualizar controles de overlay
    const overlayConfig = state.preferencias.overlayPorSlide[slideIndex] || {
        enabled: true,
        color: state.preferencias.overlayColor,
        opacity: state.preferencias.overlayOpacity
    };
    
    overlayColorPicker.value = overlayConfig.color;
    overlayOpacitySlider.value = overlayConfig.opacity;
    overlayOpacityValue.textContent = `${Math.round(overlayConfig.opacity * 100)}%`;
    overlayToggle.checked = overlayConfig.enabled;
    
    // Actualizar selector de tipografía
    tipografiaOptions.forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.tipografia === state.preferencias.tipografia);
    });
}

// Actualizar modal cuando cambia el slide
const originalCambiarSlide = cambiarSlide;
cambiarSlide = function(index) {
    originalCambiarSlide(index);
    if (editModal.classList.contains('active')) {
        actualizarModalConSlideActual();
    }
};

// ═══════════════════════════════════════════════════════════════
// SECCIÓN 16: PERSISTENCIA DE PREFERENCIAS
// ═══════════════════════════════════════════════════════════════

function guardarPreferencias() {
    try {
        localStorage.setItem('despega_preferencias', JSON.stringify(state.preferencias));
        console.log('✅ Preferencias guardadas');
    } catch (error) {
        console.error('Error al guardar preferencias:', error);
    }
}

function cargarPreferencias() {
    try {
        const saved = localStorage.getItem('despega_preferencias');
        if (saved) {
            const preferencias = JSON.parse(saved);
            
            // Mantener overlay por slide vacío (cada carrusel empieza limpio)
            state.preferencias = {
                ...preferencias,
                overlayPorSlide: {}
            };
            
            console.log('✅ Preferencias cargadas');
        }
    } catch (error) {
        console.error('Error al cargar preferencias:', error);
    }
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

console.log('✅ DESPEGA Content Studio cargado');
console.log('💙 Con identidad EME360PRO');
console.log('🔐 Sistema de autenticación JWT activado');
console.log(`🌐 API Base URL: ${API_BASE_URL || 'Producción (mismo dominio)'}`);
console.log('🎨 Modal de edición activado');
