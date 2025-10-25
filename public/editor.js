/* ═════════════════════════════════════════════════════════════
   DESPEGA CONTENT STUDIO - EDITOR DE DISEÑO
   Sistema de personalización visual completo
   ═════════════════════════════════════════════════════════════ */

// Estado del editor
const editorState = {
    cambiosPendientes: {
        diseno: false,
        contenido: false
    },
    slideEditando: 0,
    configuracion: {
        fontPair: 'pair1',
        slides: [
            // Se inicializará con los slides del carrusel generado
        ]
    }
};

// Mapeo de pares tipográficos
const fontPairs = {
    pair1: {
        title: "'Libre Baskerville', serif",
        body: "'Open Sans', sans-serif",
        name: "Clásico Confiable"
    },
    pair2: {
        title: "'Montserrat', sans-serif",
        body: "'Lato', sans-serif",
        name: "Moderno Accesible"
    },
    pair3: {
        title: "'Poppins', sans-serif",
        body: "'Roboto', sans-serif",
        name: "Tech Amigable"
    },
    pair4: {
        title: "'Playfair Display', serif",
        body: "'Source Sans Pro', sans-serif",
        name: "Elegante Cercano"
    },
    pair5: {
        title: "'Raleway', sans-serif",
        body: "'Nunito', sans-serif",
        name: "Amigable Profesional"
    }
};

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL EDITOR
// ═══════════════════════════════════════════════════════════════

function initEditor() {
    // Botón abrir editor
    const btnPersonalizar = document.getElementById('btnPersonalizar');
    if (btnPersonalizar) {
        btnPersonalizar.addEventListener('click', abrirEditor);
    }

    // Botones cerrar
    const btnCloseEditor = document.getElementById('btnCloseEditor');
    if (btnCloseEditor) {
        btnCloseEditor.addEventListener('click', cerrarEditor);
    }

    const editorOverlay = document.querySelector('.editor-overlay');
    if (editorOverlay) {
        editorOverlay.addEventListener('click', cerrarEditor);
    }

    // Tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => cambiarTab(tab.dataset.tab));
    });

    // Tab Diseño - Controles
    const fontSelector = document.getElementById('fontSelector');
    if (fontSelector) {
        fontSelector.addEventListener('change', cambiarTipografia);
    }

    const overlayToggle = document.getElementById('overlayToggle');
    if (overlayToggle) {
        overlayToggle.addEventListener('change', toggleOverlay);
    }

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => seleccionarColor(swatch));
    });

    const customOverlayColor = document.getElementById('customOverlayColor');
    if (customOverlayColor) {
        customOverlayColor.addEventListener('input', cambiarColorPersonalizado);
    }

    const opacitySlider = document.getElementById('opacitySlider');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', cambiarOpacidad);
    }

    // Navegadores de slides
    const btnPrevSlideEditor = document.getElementById('btnPrevSlideEditor');
    if (btnPrevSlideEditor) {
        btnPrevSlideEditor.addEventListener('click', () => navegarSlide(-1, 'diseno'));
    }

    const btnNextSlideEditor = document.getElementById('btnNextSlideEditor');
    if (btnNextSlideEditor) {
        btnNextSlideEditor.addEventListener('click', () => navegarSlide(1, 'diseno'));
    }

    const btnPrevSlideContent = document.getElementById('btnPrevSlideContent');
    if (btnPrevSlideContent) {
        btnPrevSlideContent.addEventListener('click', () => navegarSlide(-1, 'contenido'));
    }

    const btnNextSlideContent = document.getElementById('btnNextSlideContent');
    if (btnNextSlideContent) {
        btnNextSlideContent.addEventListener('click', () => navegarSlide(1, 'contenido'));
    }

    // Tab Contenido - Controles
    const editTitle = document.getElementById('editTitle');
    if (editTitle) {
        editTitle.addEventListener('input', actualizarContador);
    }

    const editText = document.getElementById('editText');
    if (editText) {
        editText.addEventListener('input', actualizarContador);
    }

    const btnRegenText = document.getElementById('btnRegenText');
    if (btnRegenText) {
        btnRegenText.addEventListener('click', abrirModalRegen);
    }

    // CTA Controls
    const editCtaText = document.getElementById('editCtaText');
    if (editCtaText) {
        editCtaText.addEventListener('input', marcarCambio);
    }

    const ctaBgColor = document.getElementById('ctaBgColor');
    if (ctaBgColor) {
        ctaBgColor.addEventListener('input', marcarCambio);
    }

    const ctaTextColor = document.getElementById('ctaTextColor');
    if (ctaTextColor) {
        ctaTextColor.addEventListener('input', marcarCambio);
    }

    const ctaBorderToggle = document.getElementById('ctaBorderToggle');
    if (ctaBorderToggle) {
        ctaBorderToggle.addEventListener('change', marcarCambio);
    }

    // Footer buttons
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarCambios);
    }

    const btnAplicar = document.getElementById('btnAplicar');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', aplicarCambios);
    }

    // Modal Regenerar
    const btnCancelRegen = document.getElementById('btnCancelRegen');
    if (btnCancelRegen) {
        btnCancelRegen.addEventListener('click', cerrarModalRegen);
    }

    const btnConfirmRegen = document.getElementById('btnConfirmRegen');
    if (btnConfirmRegen) {
        btnConfirmRegen.addEventListener('click', regenerarTextoConOpciones);
    }

    // Cargar preferencias guardadas
    cargarPreferencias();
}

// ═══════════════════════════════════════════════════════════════
// ABRIR/CERRAR EDITOR
// ═══════════════════════════════════════════════════════════════

function abrirEditor() {
    if (!state.carrusel) {
        alert('Primero genera un carrusel');
        return;
    }

    // Inicializar configuración con el carrusel actual
    editorState.configuracion.slides = JSON.parse(JSON.stringify(state.carrusel.slides));
    editorState.slideEditando = state.slideActual;

    // Resetear cambios pendientes
    editorState.cambiosPendientes = { diseno: false, contenido: false };
    actualizarBadges();

    // Cargar valores actuales
    cargarValoresEditor();

    // Mostrar modal
    document.getElementById('editorModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Actualizar preview
    actualizarPreview();
}

function cerrarEditor() {
    // Verificar cambios pendientes
    if (editorState.cambiosPendientes.diseno || editorState.cambiosPendientes.contenido) {
        if (!confirm('Tienes cambios sin guardar.\n¿Deseas descartarlos?')) {
            return;
        }
    }

    document.getElementById('editorModal').style.display = 'none';
    document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════

function cambiarTab(tabName) {
    // Actualizar tabs
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Actualizar contenido
    document.querySelectorAll('.editor-tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.content === tabName);
    });

    // Si cambia a contenido, cargar campos del slide actual
    if (tabName === 'contenido') {
        cargarCamposContenido();
    }

    // Si cambia a preview, actualizar
    if (tabName === 'preview') {
        actualizarPreview();
    }
}

// ═══════════════════════════════════════════════════════════════
// TAB DISEÑO - FUNCIONES
// ═══════════════════════════════════════════════════════════════

function cargarValoresEditor() {
    const slideIndex = editorState.slideEditando;
    const slideConfig = editorState.configuracion.slides[slideIndex];

    // Selector de fuente
    document.getElementById('fontSelector').value = editorState.configuracion.fontPair || 'pair1';

    // Navegador
    document.getElementById('currentSlideEditor').textContent = `Slide ${slideIndex + 1}`;
    document.getElementById('currentSlideContent').textContent = `Slide ${slideIndex + 1}`;

    // Mostrar/ocultar controles según tipo de slide
    if (slideConfig.tipo === 'cierre') {
        document.getElementById('overlayControls').style.display = 'none';
        document.getElementById('slide5Controls').style.display = 'block';

        // Seleccionar color de fondo actual
        const bgColor = slideConfig.backgroundColor || '#F5F0E8';
        document.querySelectorAll('#slide5Controls .color-swatch').forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color === bgColor);
        });
    } else {
        document.getElementById('overlayControls').style.display = 'block';
        document.getElementById('slide5Controls').style.display = 'none';

        // Overlay toggle
        const hasOverlay = slideConfig.overlay !== false;
        document.getElementById('overlayToggle').checked = hasOverlay;
        document.getElementById('overlayColorSection').style.display = hasOverlay ? 'block' : 'none';

        // Color y opacidad
        const overlayColor = slideConfig.overlayColor || '#2C5F8D';
        const opacity = slideConfig.overlayOpacity || 60;

        document.getElementById('customOverlayColor').value = overlayColor;
        document.getElementById('opacitySlider').value = opacity;
        document.getElementById('opacityValue').textContent = opacity;

        // Marcar color activo en paleta
        document.querySelectorAll('#overlayControls .color-swatch').forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color === overlayColor);
        });
    }

    // Actualizar botones de navegación
    document.getElementById('btnPrevSlideEditor').disabled = slideIndex === 0;
    document.getElementById('btnNextSlideEditor').disabled = slideIndex === state.carrusel.slides.length - 1;
    document.getElementById('btnPrevSlideContent').disabled = slideIndex === 0;
    document.getElementById('btnNextSlideContent').disabled = slideIndex === state.carrusel.slides.length - 1;
}

function cambiarTipografia(e) {
    editorState.configuracion.fontPair = e.target.value;
    marcarCambio('diseno');
    actualizarPreview();
}

function toggleOverlay(e) {
    const slideIndex = editorState.slideEditando;
    editorState.configuracion.slides[slideIndex].overlay = e.target.checked;

    document.getElementById('overlayColorSection').style.display = e.target.checked ? 'block' : 'none';

    marcarCambio('diseno');
    actualizarPreview();
}

function seleccionarColor(swatchElement) {
    const color = swatchElement.dataset.color;
    const slideIndex = editorState.slideEditando;
    const slideConfig = editorState.configuracion.slides[slideIndex];

    // Actualizar UI
    swatchElement.parentElement.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
    });
    swatchElement.classList.add('active');

    if (slideConfig.tipo === 'cierre') {
        // Color de fondo para slide 5
        slideConfig.backgroundColor = color;
    } else {
        // Color de overlay para slides 1-4
        slideConfig.overlayColor = color;
        document.getElementById('customOverlayColor').value = color;
    }

    marcarCambio('diseno');
    actualizarPreview();
}

function cambiarColorPersonalizado(e) {
    const color = e.target.value;
    const slideIndex = editorState.slideEditando;
    editorState.configuracion.slides[slideIndex].overlayColor = color;

    // Desmarcar paleta
    document.querySelectorAll('#overlayControls .color-swatch').forEach(s => {
        s.classList.remove('active');
    });

    marcarCambio('diseno');
    actualizarPreview();
}

function cambiarOpacidad(e) {
    const opacity = e.target.value;
    const slideIndex = editorState.slideEditando;
    editorState.configuracion.slides[slideIndex].overlayOpacity = opacity;

    document.getElementById('opacityValue').textContent = opacity;

    marcarCambio('diseno');
    actualizarPreview();
}

function navegarSlide(direction, context) {
    const newIndex = editorState.slideEditando + direction;

    if (newIndex < 0 || newIndex >= state.carrusel.slides.length) return;

    editorState.slideEditando = newIndex;
    cargarValoresEditor();

    if (context === 'contenido') {
        cargarCamposContenido();
    }

    actualizarPreview();
}

// ═══════════════════════════════════════════════════════════════
// TAB CONTENIDO - FUNCIONES
// ═══════════════════════════════════════════════════════════════

function cargarCamposContenido() {
    const slideIndex = editorState.slideEditando;
    const slideConfig = editorState.configuracion.slides[slideIndex];

    // Limpiar campos
    document.getElementById('editTitle').value = '';
    document.getElementById('editText').value = '';
    document.getElementById('editCtaText').value = '';

    // Mostrar/ocultar campos según tipo
    if (slideConfig.tipo === 'cierre') {
        document.getElementById('textField').style.display = 'none';
        document.getElementById('puntosField').style.display = 'block';
        document.getElementById('ctaField').style.display = 'none';

        // Cargar título y puntos
        document.getElementById('editTitle').value = slideConfig.titulo || '';
        document.getElementById('editPunto1').value = slideConfig.puntos?.[0]?.replace('✓ ', '') || '';
        document.getElementById('editPunto2').value = slideConfig.puntos?.[1]?.replace('✓ ', '') || '';
        document.getElementById('editPunto3').value = slideConfig.puntos?.[2]?.replace('✓ ', '') || '';
    } else {
        document.getElementById('textField').style.display = 'block';
        document.getElementById('puntosField').style.display = 'none';
        document.getElementById('ctaField').style.display = 'block';

        // Cargar título, texto y CTA
        document.getElementById('editTitle').value = slideConfig.titulo || '';
        document.getElementById('editText').value = slideConfig.texto || '';
        document.getElementById('editCtaText').value = slideConfig.cta_button || '';

        // CTA colors
        document.getElementById('ctaBgColor').value = slideConfig.ctaBgColor || '#8B9D77';
        document.getElementById('ctaTextColor').value = slideConfig.ctaTextColor || '#FFFFFF';
        document.getElementById('ctaBorderToggle').checked = slideConfig.ctaBorder || false;
    }

    // Actualizar contadores
    actualizarContador({ target: document.getElementById('editTitle') });
    if (slideConfig.tipo !== 'cierre') {
        actualizarContador({ target: document.getElementById('editText') });
    }
}

function actualizarContador(e) {
    const input = e.target;
    const maxLength = parseInt(input.maxLength) || 0;
    const currentLength = input.value.length;

    let counter;
    if (input.id === 'editTitle') {
        counter = document.getElementById('titleCounter');
    } else if (input.id === 'editText') {
        counter = document.getElementById('textCounter');
    }

    if (counter) {
        counter.textContent = `${currentLength}/${maxLength}`;

        // Colores según límite
        counter.classList.remove('warning', 'error');
        if (currentLength > maxLength * 0.9) {
            counter.classList.add('error');
        } else if (currentLength > maxLength * 0.7) {
            counter.classList.add('warning');
        }
    }

    // Guardar cambio en configuración
    const slideIndex = editorState.slideEditando;
    const slideConfig = editorState.configuracion.slides[slideIndex];

    if (input.id === 'editTitle') {
        slideConfig.titulo = input.value;
    } else if (input.id === 'editText') {
        slideConfig.texto = input.value;
    }

    marcarCambio('contenido');
    actualizarPreview();
}

// ═══════════════════════════════════════════════════════════════
// REGENERAR TEXTO CON IA
// ═══════════════════════════════════════════════════════════════

function abrirModalRegen() {
    const slideIndex = editorState.slideEditando;
    document.getElementById('regenSlideNumber').textContent = `Slide ${slideIndex + 1}`;
    document.getElementById('regenInstructions').value = '';

    // Desmarcar checkboxes
    document.querySelectorAll('.regen-options input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    document.getElementById('regenModal').style.display = 'flex';
}

function cerrarModalRegen() {
    document.getElementById('regenModal').style.display = 'none';
}

async function regenerarTextoConOpciones() {
    const slideIndex = editorState.slideEditando;
    const slideActual = editorState.configuracion.slides[slideIndex];
    const tema = state.carrusel.tema;

    // Recopilar instrucciones
    const instruccionesLibres = document.getElementById('regenInstructions').value.trim();
    const opcionesRapidas = [];

    document.querySelectorAll('.regen-options input[type="checkbox"]:checked').forEach(cb => {
        opcionesRapidas.push(cb.value);
    });

    const instruccionesCombinadas = [
        instruccionesLibres,
        ...opcionesRapidas
    ].filter(Boolean).join('. ');

    if (!instruccionesCombinadas) {
        alert('Por favor indica qué quieres ajustar');
        return;
    }

    cerrarModalRegen();

    // Mostrar loading
    document.getElementById('btnRegenText').disabled = true;
    document.getElementById('btnRegenText').textContent = 'Regenerando...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/regenerar-slide`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                tema: tema,
                numero_slide: slideIndex + 1,
                slide_actual: slideActual,
                contexto_carrusel: editorState.configuracion.slides,
                instrucciones_usuario: instruccionesCombinadas
            })
        });

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) throw new Error('Error al regenerar');

        const data = await response.json();

        // Actualizar slide con nuevo contenido (mantener diseño)
        const nuevoSlide = {
            ...slideActual, // Mantiene overlay, colores, etc.
            ...data.slide,   // Actualiza solo contenido
        };

        editorState.configuracion.slides[slideIndex] = nuevoSlide;

        // Recargar campos
        cargarCamposContenido();
        actualizarPreview();

        marcarCambio('contenido');

        alert('Texto regenerado exitosamente');

    } catch (error) {
        console.error('Error:', error);
        alert('Error al regenerar texto');
    } finally {
        document.getElementById('btnRegenText').disabled = false;
        document.getElementById('btnRegenText').innerHTML = '🔄 Regenerar texto con IA';
    }
}

// ═══════════════════════════════════════════════════════════════
// PREVIEW
// ═══════════════════════════════════════════════════════════════

function actualizarPreview() {
    const previewContainer = document.getElementById('editorPreviewSlide');
    const slideIndex = editorState.slideEditando;
    const slideConfig = editorState.configuracion.slides[slideIndex];
    const fontPair = fontPairs[editorState.configuracion.fontPair];

    previewContainer.innerHTML = '';

    if (slideConfig.tipo === 'cierre') {
        // Slide 5 - Cierre
        const bgColor = slideConfig.backgroundColor || '#F5F0E8';

        previewContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                background: ${bgColor};
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 8%;
                text-align: center;
            ">
                <div style="
                    font-family: ${fontPair.title};
                    font-size: clamp(16px, 2.5vw, 32px);
                    font-weight: 700;
                    color: #2C5F8D;
                    margin-bottom: 20px;
                ">${slideConfig.titulo}</div>

                <div style="
                    width: 100%;
                    max-width: 85%;
                    text-align: left;
                    margin-bottom: 20px;
                ">
                    ${(slideConfig.puntos || []).map(punto => `
                        <div style="
                            font-family: ${fontPair.body};
                            font-size: clamp(12px, 1.8vw, 18px);
                            font-weight: 600;
                            color: #333;
                            margin-bottom: 10px;
                            padding-left: 20px;
                            position: relative;
                        ">
                            <span style="
                                position: absolute;
                                left: 0;
                                color: #8B9D77;
                                font-weight: 700;
                            ">✓</span>
                            ${punto.replace('✓', '').trim()}
                        </div>
                    `).join('')}
                </div>

                ${slideConfig.cta ? `
                    <div style="
                        font-family: ${fontPair.body};
                        font-size: clamp(14px, 2vw, 20px);
                        font-weight: 700;
                        color: #2C5F8D;
                        margin-bottom: 15px;
                    ">${slideConfig.cta}</div>
                ` : ''}

                <div style="
                    background: #8B9D77;
                    color: white;
                    padding: clamp(8px, 1.2vw, 12px) clamp(20px, 3vw, 36px);
                    border-radius: 8px;
                    font-family: ${fontPair.body};
                    font-weight: 700;
                    font-size: clamp(12px, 1.5vw, 16px);
                    margin-bottom: 15px;
                ">Envía DM 🚀</div>

                <div style="
                    font-family: ${fontPair.body};
                    font-size: clamp(10px, 1.5vw, 16px);
                    font-weight: 600;
                    color: #8B9D77;
                ">#DESPEGAconOdiley</div>
            </div>
        `;
    } else {
        // Slides 1-4 - Con imagen y overlay
        const overlayColor = slideConfig.overlayColor || '#2C5F8D';
        const overlayOpacity = slideConfig.overlayOpacity || 60;
        const hasOverlay = slideConfig.overlay !== false;

        const ctaBgColor = slideConfig.ctaBgColor || '#8B9D77';
        const ctaTextColor = slideConfig.ctaTextColor || '#FFFFFF';
        const ctaBorder = slideConfig.ctaBorder ? `2px solid ${ctaTextColor}` : 'none';

        previewContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%;">
                <img src="${state.imagenBase64}" style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                " />

                ${hasOverlay ? `
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: ${overlayColor};
                        opacity: ${overlayOpacity / 100};
                    "></div>
                ` : ''}

                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 8%;
                    text-align: center;
                ">
                    <div style="
                        font-family: ${fontPair.title};
                        font-size: clamp(18px, 3vw, 36px);
                        font-weight: 700;
                        color: white;
                        margin-bottom: 15px;
                        text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                    ">${slideConfig.titulo}</div>

                    ${slideConfig.texto ? `
                        <div style="
                            font-family: ${fontPair.body};
                            font-size: clamp(12px, 1.8vw, 20px);
                            color: white;
                            line-height: 1.6;
                            text-shadow: 1px 1px 4px rgba(0,0,0,0.3);
                            margin-bottom: 15px;
                        ">${slideConfig.texto}</div>
                    ` : ''}

                    ${slideConfig.cta_button ? `
                        <div style="
                            display: inline-block;
                            background: ${ctaBgColor};
                            color: ${ctaTextColor};
                            padding: clamp(8px, 1.2vw, 12px) clamp(20px, 3vw, 32px);
                            border-radius: 8px;
                            font-family: ${fontPair.body};
                            font-weight: 700;
                            font-size: clamp(12px, 1.5vw, 16px);
                            border: ${ctaBorder};
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        ">${slideConfig.cta_button}</div>
                    ` : ''}
                </div>

                <div style="
                    position: absolute;
                    bottom: 55px;
                    right: 25px;
                    font-family: ${fontPair.body};
                    font-size: clamp(10px, 1.5vw, 16px);
                    font-weight: 600;
                    color: white;
                    text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
                ">#DESPEGAconOdiley</div>
            </div>
        `;
    }
}

// ═══════════════════════════════════════════════════════════════
// APLICAR/CANCELAR CAMBIOS
// ═══════════════════════════════════════════════════════════════

function marcarCambio(tab) {
    if (tab === 'diseno' || tab === undefined) {
        editorState.cambiosPendientes.diseno = true;
    }
    if (tab === 'contenido' || tab === undefined) {
        editorState.cambiosPendientes.contenido = true;
    }
    actualizarBadges();
}

function actualizarBadges() {
    const disenoTab = document.querySelector('[data-tab="diseno"] .tab-badge');
    const contenidoTab = document.querySelector('[data-tab="contenido"] .tab-badge');

    if (disenoTab) {
        disenoTab.style.display = editorState.cambiosPendientes.diseno ? 'block' : 'none';
    }
    if (contenidoTab) {
        contenidoTab.style.display = editorState.cambiosPendientes.contenido ? 'block' : 'none';
    }
}

function cancelarCambios() {
    if (editorState.cambiosPendientes.diseno || editorState.cambiosPendientes.contenido) {
        if (!confirm('Tienes cambios sin guardar.\n¿Deseas descartarlos?')) {
            return;
        }
    }
    cerrarEditor();
}

async function aplicarCambios() {
    // Recopilar todos los cambios de contenido pendientes
    const slideIndex = editorState.slideEditando;
    const slideConfig = editorState.configuracion.slides[slideIndex];

    // Guardar campos actuales antes de aplicar
    if (slideConfig.tipo === 'cierre') {
        slideConfig.puntos = [
            document.getElementById('editPunto1').value ? '✓ ' + document.getElementById('editPunto1').value : '',
            document.getElementById('editPunto2').value ? '✓ ' + document.getElementById('editPunto2').value : '',
            document.getElementById('editPunto3').value ? '✓ ' + document.getElementById('editPunto3').value : ''
        ].filter(Boolean);
    } else {
        slideConfig.cta_button = document.getElementById('editCtaText').value;
        slideConfig.ctaBgColor = document.getElementById('ctaBgColor').value;
        slideConfig.ctaTextColor = document.getElementById('ctaTextColor').value;
        slideConfig.ctaBorder = document.getElementById('ctaBorderToggle').checked;
    }

    // Aplicar configuración al carrusel principal
    state.carrusel.slides = editorState.configuracion.slides;

    // Guardar preferencias de diseño
    guardarPreferencias();

    // Re-renderizar carrusel con nuevos valores
    const formato = document.querySelector('.canvas-container').classList.contains('formato-stories')
        ? 'stories'
        : document.querySelector('.canvas-container').classList.contains('formato-horizontal')
        ? 'horizontal'
        : 'cuadrado';

    renderizarCarruselConPersonalizacion(formato);

    // Volver al slide que estaba editando
    cambiarSlide(editorState.slideEditando);

    // Cerrar editor
    document.getElementById('editorModal').style.display = 'none';
    document.body.style.overflow = '';

    // Resetear estado
    editorState.cambiosPendientes = { diseno: false, contenido: false };
    actualizarBadges();
}

// ═══════════════════════════════════════════════════════════════
// RENDERIZAR CARRUSEL CON PERSONALIZACIÓN
// ═══════════════════════════════════════════════════════════════

function renderizarCarruselConPersonalizacion(formato) {
    const slidesContainer = document.getElementById('slidesContainer');
    const thumbnailsContainer = document.getElementById('thumbnails');
    const canvasContainer = document.getElementById('canvasContainer');

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

    const fontPair = fontPairs[editorState.configuracion.fontPair];

    // Renderizar cada slide con personalización
    state.carrusel.slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        slideDiv.dataset.index = index;
        if (index === state.slideActual) slideDiv.classList.add('active');

        if (slide.tipo === 'cierre') {
            // Slide 5
            const bgColor = slide.backgroundColor || '#F5F0E8';

            slideDiv.innerHTML = `
                <div class="slide-cierre" style="background: ${bgColor};">
                    <div class="slide-title" style="font-family: ${fontPair.title};">${slide.titulo}</div>
                    <ul class="slide-list" style="font-family: ${fontPair.body};">
                        ${slide.puntos.map(p => `<li>${p.replace('✓', '').trim()}</li>`).join('')}
                    </ul>
                    ${slide.cta ? `<div class="slide-cta-text" style="font-family: ${fontPair.body};">${slide.cta}</div>` : ''}
                    <div class="slide-dm-btn" style="font-family: ${fontPair.body};">Envía DM 🚀</div>
                    <div class="slide-tag" style="font-family: ${fontPair.body};">${slide.firma || '#DESPEGAconOdiley'}</div>
                </div>
            `;
        } else {
            // Slides 1-4
            const hasOverlay = slide.overlay !== false;
            const overlayColor = slide.overlayColor || '#2C5F8D';
            const overlayOpacity = slide.overlayOpacity || 60;
            const ctaBgColor = slide.ctaBgColor || '#8B9D77';
            const ctaTextColor = slide.ctaTextColor || '#FFFFFF';
            const ctaBorder = slide.ctaBorder ? `border: 2px solid ${ctaTextColor};` : '';

            slideDiv.innerHTML = `
                <img src="${state.imagenBase64}" alt="Background" class="slide-bg">
                <div class="slide-overlay" style="
                    ${hasOverlay ? `background: ${overlayColor}; opacity: ${overlayOpacity / 100};` : 'display: none;'}
                "></div>
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 8%;
                    text-align: center;
                    z-index: 1;
                ">
                    <div class="slide-title" style="font-family: ${fontPair.title};">${slide.titulo}</div>
                    ${slide.texto ? `<div class="slide-text" style="font-family: ${fontPair.body};">${slide.texto}</div>` : ''}
                    ${slide.cta_button ? `
                        <div class="slide-cta" style="
                            font-family: ${fontPair.body};
                            background: ${ctaBgColor};
                            color: ${ctaTextColor};
                            ${ctaBorder}
                        ">${slide.cta_button}</div>
                    ` : ''}
                    <div class="slide-tag" style="font-family: ${fontPair.body};">#DESPEGAconOdiley</div>
                </div>
            `;
        }

        slidesContainer.appendChild(slideDiv);

        // Thumbnail
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.textContent = index + 1;
        if (index === state.slideActual) thumb.classList.add('active');
        thumb.addEventListener('click', () => cambiarSlide(index));
        thumbnailsContainer.appendChild(thumb);
    });
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENCIA (localStorage)
// ═══════════════════════════════════════════════════════════════

function guardarPreferencias() {
    const preferencias = {
        fontPair: editorState.configuracion.fontPair,
        defaultOverlayColor: editorState.configuracion.slides[0]?.overlayColor || '#2C5F8D',
        defaultOverlayOpacity: editorState.configuracion.slides[0]?.overlayOpacity || 60,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem('despega_preferencias', JSON.stringify(preferencias));
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

            // Aplicar preferencias como defaults
            editorState.configuracion.fontPair = preferencias.fontPair || 'pair1';

            console.log('✅ Preferencias cargadas');
            return preferencias;
        }
    } catch (error) {
        console.error('Error al cargar preferencias:', error);
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZAR AL CARGAR
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    console.log('✅ Editor inicializado');
});
