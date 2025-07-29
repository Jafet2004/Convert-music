document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    const header = document.querySelector('header');
    

    
    // Comprobar preferencias
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    // Aplicar tema almacenado o preferencia del sistema
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Alternar modo con optimizaciones móviles
    darkModeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        

        
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
    
    // Escuchar cambios en las preferencias del sistema
    prefersDarkScheme.addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }
    });
    
    // Efecto de scroll en el header optimizado para móviles
    let scrollTimeout;
    window.addEventListener('scroll', function() {

    }, { passive: true });
    
    // Funciones para activar/desactivar modo oscuro
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        if (darkModeIcon) {
            darkModeIcon.classList.replace('fa-moon', 'fa-sun');
        }
        if (darkModeText) {
            darkModeText.textContent = 'Modo Claro';
        }
        localStorage.setItem('theme', 'dark');
        

    }
    
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        if (darkModeIcon) {
            darkModeIcon.classList.replace('fa-sun', 'fa-moon');
        }
        if (darkModeText) {
            darkModeText.textContent = 'Modo Oscuro';
        }
        localStorage.setItem('theme', 'light');
        

    }
    

    
    // Optimizaciones para pantallas de alta densidad
    if (window.devicePixelRatio >= 2) {
        const retinaStyle = document.createElement('style');
        retinaStyle.textContent = `
            .dark-mode .tool-card,
            .dark-mode .navbar,
            .dark-mode .modal-content {
                border-width: 0.5px !important;
            }
        `;
        document.head.appendChild(retinaStyle);
    }
    

    
    // Optimizaciones para conexiones lentas
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            const slowConnectionStyle = document.createElement('style');
            slowConnectionStyle.textContent = `
                .dark-mode * {
                    transition-duration: 0.1s !important;
                }
            `;
            document.head.appendChild(slowConnectionStyle);
        }
    }
    
    // Limpieza de memoria
    window.addEventListener('beforeunload', function() {
        clearTimeout(scrollTimeout);
    });
});