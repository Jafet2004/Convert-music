document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const registerError = document.getElementById('registerError');
    const registerButton = registerForm.querySelector('button[type="submit"]');

    // Redirigir si ya hay usuario logueado
    if (sessionStorage.getItem('user')) {
        window.location.href = 'index.html';
        return;
    }

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Limpiar errores
        registerError.classList.add('d-none');
        registerError.classList.remove('alert-success', 'alert-danger');
        registerError.textContent = '';

        // Capturar valores
        const primerNombre = document.getElementById('primer_nombre').value.trim();
        const primerApellido = document.getElementById('primer_apellido').value.trim();
        const correo = document.getElementById('correo_electronico').value.trim();
        const username = document.getElementById('user_name').value.trim();
        const password = document.getElementById('pass').value;
        const pais = document.getElementById('pais').value.trim();
        const ciudad = document.getElementById('ciudad').value.trim();

        // Validaciones básicas
        if (!primerNombre || !primerApellido || !correo || !username || !password) {
            showError('Los campos marcados con * son obligatorios');
            return;
        }

        // Validación de correo
        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
        if (!correoValido) {
            showError('Ingrese un correo electrónico válido (ejemplo@dominio.com)');
            return;
        }

        // Validación de nombre de usuario
        if (username.includes(' ')) {
            showError('El nombre de usuario no puede contener espacios');
            return;
        }

        // Validación de contraseña
        if (password.length < 8) {
            showError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            // Mostrar carga
            registerButton.disabled = true;
            registerButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Registrando...';

            const userData = {
                primer_nombre: primerNombre,
                primer_apellido: primerApellido,
                correo_electronico: correo,
                user_name: username,
                pass: password,
                pais: pais || null,
                ciudad: ciudad || null
            };

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error en el registro');
            }

            // Éxito
            registerError.textContent = '¡Registro exitoso! Redirigiendo...';
            registerError.classList.remove('d-none', 'alert-danger');
            registerError.classList.add('alert-success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Error al registrar:', error);
            showError(error.message || 'No se pudo conectar al servidor');
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Registrarse';
        }
    });

    function showError(message) {
        registerError.textContent = message;
        registerError.classList.remove('d-none');
        registerError.classList.remove('alert-success');
        registerError.classList.add('alert-danger');
    }
});
