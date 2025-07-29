            // Welcome Animation - Control de tiempo simplificado
        window.addEventListener('load', () => {
            // Ocultar animaciones después de 3 segundos
            setTimeout(() => {
                const dayAnimation = document.getElementById('welcome-animation-day');
                const nightAnimation = document.getElementById('welcome-animation-night');
                
                // Ocultar ambas animaciones completamente
                if (dayAnimation) {
                    dayAnimation.style.opacity = '0';
                    dayAnimation.style.display = 'none';
                    dayAnimation.style.visibility = 'hidden';
                    dayAnimation.style.zIndex = '-9999';
                    dayAnimation.style.pointerEvents = 'none';
                    dayAnimation.classList.add('hidden');
                    dayAnimation.remove();
                }
                if (nightAnimation) {
                    nightAnimation.style.opacity = '0';
                    nightAnimation.style.display = 'none';
                    nightAnimation.style.visibility = 'hidden';
                    nightAnimation.style.zIndex = '-9999';
                    nightAnimation.style.pointerEvents = 'none';
                    nightAnimation.classList.add('hidden');
                    nightAnimation.remove();
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
        
        // Función para detectar dispositivo móvil (solo para optimizaciones, no para restricciones)
        function isMobileDevice() {
            return window.innerWidth <= 768;
        }
        
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            
            // Agregar feedback táctil para móviles
            if (isMobileDevice()) {
                darkModeToggle.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    darkModeToggle.style.transform = 'scale(1)';
                }, 150);
            }
            
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
                    // Ajustar offset para móviles
                    const offset = isMobileDevice() ? 60 : 80;
                    
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
            
            // Usar throttling para mejor rendimiento en móviles
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 50) {
                    header.style.background = 'rgba(26, 26, 46, 0.9)';
                    header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                } else {
                    header.style.background = 'var(--glass)';
                    header.style.boxShadow = 'none';
                }
            }, isMobileDevice() ? 50 : 10);
        }, { passive: true });

        // Optimizaciones adicionales para móviles
        if (isMobileDevice()) {
            // Mejorar rendimiento de animaciones en móviles
            const animatedElements = document.querySelectorAll('.floating-card, .sun, .moon, .cloud, .star');
            animatedElements.forEach(element => {
                element.style.willChange = 'transform';
            });

            // Optimizar eventos táctiles
            const touchElements = document.querySelectorAll('.btn, .nav-link, .dropdown-item, .tool-link');
            touchElements.forEach(element => {
                element.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                element.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                }, { passive: true });
            });

            // Prevenir zoom en inputs
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    // Scroll suave al input
                    setTimeout(() => {
                        this.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }, 300);
                });
            });

            // Optimizar scroll para mejor rendimiento
            let ticking = false;
            function updateScroll() {
                ticking = false;
            }

            window.addEventListener('scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(updateScroll);
                    ticking = true;
                }
            }, { passive: true });

            // Mejorar manejo de orientación
            window.addEventListener('orientationchange', function() {
                // Recalcular posiciones después del cambio de orientación
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 500);
            });
        }

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