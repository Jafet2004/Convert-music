document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('user_name');
    const passwordInput = document.getElementById('pass');
    const loginError = document.getElementById('loginError');
    const loginButton = document.getElementById('loginButton');
    const usernameFeedback = document.getElementById('usernameFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');

    // Verificar si ya está logueado
    if (sessionStorage.getItem('user')) {
        window.location.href = 'index.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Resetear estados de error
        usernameInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');
        loginError.classList.add('d-none');
        
        // Validar campos
        let isValid = true;
        if (!usernameInput.value.trim()) {
            usernameInput.classList.add('is-invalid');
            usernameFeedback.textContent = 'Por favor ingresa tu nombre de usuario';
            isValid = false;
        }
        if (!passwordInput.value.trim()) {
            passwordInput.classList.add('is-invalid');
            passwordFeedback.textContent = 'Por favor ingresa tu contraseña';
            isValid = false;
        }
        
        if (!isValid) {
            loginError.textContent = 'Por favor completa todos los campos';
            loginError.classList.remove('d-none');
            return;
        }

        try {
            // Mostrar estado de carga
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...';
            
            // Enviar solicitud al servidor
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    user_name: usernameInput.value.trim(), 
                    pass: passwordInput.value.trim() 
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Credenciales incorrectas');
            }

            // Guardar datos del usuario en sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirigir a index.html
            window.location.href = data.redirect;
            
        } catch (error) {
            console.error('Error en login:', error);
            loginError.textContent = error.message || 'Error al conectar con el servidor';
            loginError.classList.remove('d-none');
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            // Restaurar botón
            loginButton.disabled = false;
            loginButton.textContent = 'Iniciar sesión';
        }
    });

    // Manejar login con Google
    document.getElementById('googleLogin').addEventListener('click', function(e) {
        e.preventDefault();
        loginError.textContent = 'Login con Google no implementado aún';
        loginError.classList.remove('d-none');
    });

    // Manejar login con Facebook
    document.getElementById('facebookLogin').addEventListener('click', function(e) {
        e.preventDefault();
        loginError.textContent = 'Login con Facebook no implementado aún';
        loginError.classList.remove('d-none');
    });
});
