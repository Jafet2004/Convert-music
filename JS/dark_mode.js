document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    const header = document.querySelector('header');
    
    // Función para detectar dispositivo móvil
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
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
        
        // Agregar feedback táctil para móviles
        if (isMobileDevice()) {
            darkModeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                darkModeToggle.style.transform = 'scale(1)';
            }, 150);
        }
        
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
        // Usar throttling para mejor rendimiento en móviles
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, isMobileDevice() ? 50 : 10);
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
        
        // Optimizaciones específicas para móviles en modo oscuro
        if (isMobileDevice()) {
            // Ajustar contraste para mejor legibilidad en móviles
            const style = document.createElement('style');
            style.id = 'mobile-dark-optimizations';
            style.textContent = `
                .dark-mode .tool-card {
                    background: rgba(26, 26, 46, 0.9) !important;
                    border-color: rgba(255, 255, 255, 0.15) !important;
                }
                .dark-mode .navbar-collapse {
                    background: rgba(26, 26, 46, 0.95) !important;
                }
                .dark-mode .modal-content {
                    background: rgba(26, 26, 46, 0.95) !important;
                }
            `;
            
            // Remover estilos anteriores si existen
            const existingStyle = document.getElementById('mobile-dark-optimizations');
            if (existingStyle) {
                existingStyle.remove();
            }
            document.head.appendChild(style);
        }
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
        
        // Remover optimizaciones móviles específicas del modo oscuro
        const mobileStyle = document.getElementById('mobile-dark-optimizations');
        if (mobileStyle) {
            mobileStyle.remove();
        }
    }
    
    // Optimizaciones adicionales para móviles
    if (isMobileDevice()) {
        // Mejorar rendimiento de transiciones en móviles
        const style = document.createElement('style');
        style.textContent = `
            .dark-mode * {
                transition-duration: 0.2s !important;
            }
            .dark-mode .tool-card,
            .dark-mode .navbar,
            .dark-mode .modal-content {
                transition-duration: 0.3s !important;
            }
        `;
        document.head.appendChild(style);
        
        // Optimizar eventos táctiles para el toggle
        darkModeToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.9)';
        }, { passive: false });
        
        darkModeToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
        }, { passive: false });
        
        // Prevenir zoom accidental
        darkModeToggle.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
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
    
    // Manejo de cambios de orientación en móviles
    if (isMobileDevice()) {
        window.addEventListener('orientationchange', function() {
            // Recalcular estilos después del cambio de orientación
            setTimeout(() => {
                if (document.body.classList.contains('dark-mode')) {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
            }, 500);
        });
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