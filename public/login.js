/* ═════════════════════════════════════════════════════════════
   DESPEGA CONTENT STUDIO - LOGIN
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
        console.log('Intentando login con:', { username, passwordLength: password.length });
        
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok && data.success) {
            // Login exitoso - redirigir a la app principal
            console.log('Login exitoso, redirigiendo...');
            window.location.href = '/';
        } else {
            showError(data.detalles || data.error || 'Credenciales incorrectas');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }

    } catch (error) {
        console.error('Error completo:', error);
        showError('Error de conexión. Verifica tu internet e intenta nuevamente.');
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

console.log('✅ Login page cargada');
console.log('🌐 API Base URL:', API_BASE_URL || 'Producción (mismo dominio)');