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
    
    // Alternar modo
    darkModeToggle.addEventListener('click', function() {
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
    
    // Efecto de scroll en el header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Funciones para activar/desactivar modo oscuro
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        darkModeIcon.classList.replace('fa-moon', 'fa-sun');
        darkModeText.textContent = 'Modo Claro';
        localStorage.setItem('theme', 'dark');
    }
    
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        darkModeIcon.classList.replace('fa-sun', 'fa-moon');
        darkModeText.textContent = 'Modo Oscuro';
        localStorage.setItem('theme', 'light');
    }
});