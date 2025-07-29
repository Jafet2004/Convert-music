        // Script para funcionalidades adicionales del index

        // Dark Mode Toggle con optimizaciones móviles
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeIcon = document.getElementById('darkModeIcon');
        
        // Check for saved theme preference or use device preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme');
        
        if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
            document.body.setAttribute('data-theme', 'dark');
            if (darkModeIcon) {
                darkModeIcon.classList.replace('fa-moon', 'fa-sun');
            }
        }
        
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                document.body.removeAttribute('data-theme');
                if (darkModeIcon) {
                    darkModeIcon.classList.replace('fa-sun', 'fa-moon');
                }
                localStorage.setItem('theme', 'light');
            } else {
                document.body.setAttribute('data-theme', 'dark');
                if (darkModeIcon) {
                    darkModeIcon.classList.replace('fa-moon', 'fa-sun');
                }
                localStorage.setItem('theme', 'dark');
            }
        });

        // Smooth scrolling for anchor links con optimizaciones móviles
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Ajustar offset para scroll suave
                    const offset = 60;
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Header scroll effect optimizado para móviles
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            
            // Usar throttling para mejor rendimiento
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 50) {
                    header.style.background = 'rgba(26, 26, 46, 0.9)';
                    header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                } else {
                    header.style.background = 'var(--glass)';
                    header.style.boxShadow = 'none';
                }
            }, 50);
        }, { passive: true });



        // Optimizaciones para pantallas de alta densidad
        if (window.devicePixelRatio >= 2) {
            // Ajustar estilos para pantallas Retina
            const style = document.createElement('style');
            style.textContent = `
                .floating-card, .tool-card, .navbar {
                    border-width: 0.5px !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Mejoras para el manejo de memoria
        window.addEventListener('beforeunload', function() {
            // Limpiar event listeners y timeouts
            clearTimeout(scrollTimeout);
        });

        // Optimizaciones para conexiones lentas
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Reducir animaciones en conexiones lentas
                const style = document.createElement('style');
                style.textContent = `
                    .floating-card, .sun, .moon, .cloud, .star {
                        animation-duration: 0.5s !important;
                    }
                    .tool-card:hover {
                        transform: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }