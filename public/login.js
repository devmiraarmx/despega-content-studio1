/* ═════════════════════════════════════════════════════════════
   DESPEGA CONTENT STUDIO - LOGIN CON JWT
   ═════════════════════════════════════════════════════════════ */

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '';

const loginForm = document.getElementById('loginForm');
const btnLogin = document.getElementById('btnLogin');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showError('Por favor completa todos los campos');
        return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Iniciando sesión...';
    hideError();

    try {
        console.log('Intentando login...');
        
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Respuesta:', data);

        if (response.ok && data.success) {
            // Guardar token en sessionStorage
            sessionStorage.setItem('auth_token', data.token);
            sessionStorage.setItem('username', data.username);
            
            console.log('✅ Token guardado, redirigiendo...');
            
            // Redirigir a la app principal
            window.location.href = '/';
        } else {
            showError(data.detalles || data.error || 'Credenciales incorrectas');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }

    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Intenta nuevamente.');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar Sesión';
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

console.log('✅ Login page cargada con JWT');
console.log('🌐 API Base URL:', API_BASE_URL || 'Producción (mismo dominio)');