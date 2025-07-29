        // Script para funcionalidades adicionales del index

            // Welcome Animation - Asegurar visualización en todos los dispositivos
        window.addEventListener('load', () => {
            // Asegurar que la animación esté visible
            const welcomeAnimation = document.getElementById('welcome-animation');
            
            if (welcomeAnimation) {
                welcomeAnimation.style.display = 'flex';
                welcomeAnimation.style.visibility = 'visible';
                welcomeAnimation.style.opacity = '1';
                welcomeAnimation.style.zIndex = '99999';
            }
            
            // Ocultar animación después de 3 segundos
            setTimeout(() => {
                if (welcomeAnimation) {
                    welcomeAnimation.style.opacity = '0';
                    welcomeAnimation.style.transition = 'opacity 0.8s ease';
                    setTimeout(() => {
                        welcomeAnimation.style.display = 'none';
                        welcomeAnimation.style.visibility = 'hidden';
                    }, 800);
                }
            }, 3000);
        });

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
        
        // Mostrar animación de bienvenida de forma natural
        function showWelcomeAnimation() {
            const welcomeAnimation = document.getElementById('welcome-animation');
            
            // Mostrar la animación de forma natural
            if (welcomeAnimation) {
                welcomeAnimation.style.display = 'flex';
                welcomeAnimation.style.visibility = 'visible';
                welcomeAnimation.style.opacity = '1';
            }
        }
        
        // Mostrar animación al cargar la página
        showWelcomeAnimation();
        
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
            
            // Mostrar animación después del cambio de tema
            setTimeout(showWelcomeAnimation, 100);
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
            document.body.classList.add('high-dpi');
        }

        // Optimizaciones para dispositivos táctiles
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Optimizaciones para dispositivos móviles
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-device');
        }

        // Optimizaciones para dispositivos con poca memoria
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            document.body.classList.add('low-memory');
        }

        // Optimizaciones para conexiones lentas
        if (navigator.connection && navigator.connection.effectiveType === 'slow-2g') {
            document.body.classList.add('slow-connection');
        }

        // Optimizaciones para dispositivos con preferencia de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        // Optimizaciones para dispositivos con preferencia de contraste alto
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Optimizaciones para dispositivos con preferencia de color invertido
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-scheme');
        }

        // Optimizaciones para dispositivos con preferencia de color invertido
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light-scheme');
        }

        // Optimizaciones para dispositivos con preferencia de color invertido
        if (window.matchMedia('(prefers-color-scheme: no-preference)').matches) {
            document.body.classList.add('no-color-scheme');
        }