// script_register_lyrics.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const registerBtn = document.getElementById('registerBtn');
    const submitLyricsBtn = document.getElementById('submitLyrics');
    const registerForm = document.getElementById('registerForm');
    const newArtistInput = document.getElementById('newArtist');
    const newTitleInput = document.getElementById('newTitle');
    const newLyricsTextarea = document.getElementById('newLyrics');
    const resultsDiv = document.getElementById('results');
    const artistInput = document.getElementById('artist');
    const titleInput = document.getElementById('title');

    // Mostrar modal al hacer clic en "Registrar Letra Nueva"
    registerBtn.addEventListener('click', function() {
        // Limpiar el formulario al abrir el modal
        registerForm.reset();
    });

    // Manejar el envío del formulario
    submitLyricsBtn.addEventListener('click', registerNewLyrics);

    // Función para registrar nueva letra
    function registerNewLyrics() {
        const artist = newArtistInput.value.trim();
        const title = newTitleInput.value.trim();
        const lyrics = newLyricsTextarea.value.trim();

        // Validación básica
        if (!artist || !title || !lyrics) {
            showAlert('Por favor completa todos los campos', 'danger');
            return;
        }

        // Mostrar carga
        showLoading('Registrando letra...');

        // Simular envío a una API (en un caso real, aquí iría el fetch a tu backend)
        simulateApiCall(artist, title, lyrics)
            .then(response => {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                modal.hide();

                // Mostrar mensaje de éxito
                showAlert('¡Letra registrada con éxito!', 'success');

                // Opcional: Rellenar campos de búsqueda y buscar automáticamente
                artistInput.value = artist;
                titleInput.value = title;
                searchLyrics(); // Asumiendo que esta función ya existe en tu código
            })
            .catch(error => {
                showAlert('Error al registrar la letra: ' + error.message, 'danger');
            });
    }

    // Función para simular llamada a API (remplazar con fetch real en producción)
    function simulateApiCall(artist, title, lyrics) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular un 10% de probabilidad de error
                if (Math.random() < 0.1) {
                    reject(new Error('Error de conexión con el servidor'));
                } else {
                    // En una implementación real, aquí guardarías en tu base de datos
                    console.log('Letra registrada:', { artist, title, lyrics });
                    resolve({ success: true });
                }
            }, 1500); // Simular tiempo de espera de red
        });
    }

    // Función para mostrar estado de carga
    function showLoading(message = 'Cargando...') {
        resultsDiv.innerHTML = `
            <div class="alert alert-info d-flex align-items-center">
                <div class="spinner-border me-2" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                ${message}
            </div>
        `;
    }

    // Función para mostrar alertas
    function showAlert(message, type = 'info') {
        resultsDiv.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;
    }

    // Nota: La función searchLyrics() debería estar definida en tu script_liryc.js existente
});