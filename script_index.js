function updateUserDropdown() {
    try {
        const userData = JSON.parse(sessionStorage.getItem('user'));

        if (!userData) {
            console.warn('No hay datos de usuario en sessionStorage.');
            return;
        }

        const usernameEl = document.getElementById('usernameValue');
        const emailEl = document.getElementById('emailValue');
        const logoutBtn = document.getElementById('logoutItem');

        // Mostrar nombre de usuario
        if (usernameEl) {
            usernameEl.textContent = userData.user_name || 'Usuario desconocido';
        }

        // Mostrar correo electrónico
        if (emailEl) {
            // Maneja tanto 'correo_electronico' como 'email'
            emailEl.textContent = userData.correo_electronico || userData.email || 'Correo no disponible';
        }

        // Configurar botón de cerrar sesión
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('user');
                window.location.href = 'login.html';
            });
        }

    } catch (error) {
        console.error('Error al actualizar dropdown de usuario:', error);
    }
}

document.addEventListener('DOMContentLoaded', updateUserDropdown);
