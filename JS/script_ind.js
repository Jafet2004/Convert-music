            // Welcome Animation - Asegurar visualización en todos los dispositivos
        window.addEventListener('load', () => {
            // Asegurar que las animaciones estén visibles
            const dayAnimation = document.getElementById('welcome-animation-day');
            const nightAnimation = document.getElementById('welcome-animation-night');
            
            if (dayAnimation) {
                dayAnimation.style.display = 'flex';
                dayAnimation.style.visibility = 'visible';
                dayAnimation.style.opacity = '1';
                dayAnimation.style.zIndex = '99999';
            }
            if (nightAnimation) {
                nightAnimation.style.display = 'flex';
                nightAnimation.style.visibility = 'visible';
                nightAnimation.style.opacity = '1';
                nightAnimation.style.zIndex = '99999';
            }
            
            // Ocultar animaciones después de 4 segundos
            setTimeout(() => {
                if (dayAnimation) {
                    dayAnimation.style.opacity = '0';
                    dayAnimation.style.transition = 'opacity 0.8s ease';
                    setTimeout(() => {
                        dayAnimation.style.display = 'none';
                        dayAnimation.style.visibility = 'hidden';
                    }, 800);
                }
                if (nightAnimation) {
                    nightAnimation.style.opacity = '0';
                    nightAnimation.style.transition = 'opacity 0.8s ease';
                    setTimeout(() => {
                        nightAnimation.style.display = 'none';
                        nightAnimation.style.visibility = 'hidden';
                    }, 800);
                }
            }, 4000);
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
            // Solo verificar ancho de pantalla, sin restricciones de user agent
            return window.innerWidth <= 768;
        }
        
        // Función para asegurar que las animaciones se muestren en todos los dispositivos
        function ensureAnimationsForAllDevices() {
            const dayAnimation = document.getElementById('welcome-animation-day');
            const nightAnimation = document.getElementById('welcome-animation-night');
            
            // Forzar visualización en todos los dispositivos
            [dayAnimation, nightAnimation].forEach(animation => {
                if (animation) {
                    animation.style.display = 'flex';
                    animation.style.visibility = 'visible';
                    animation.style.opacity = '1';
                    animation.style.zIndex = '99999';
                    animation.style.pointerEvents = 'none';
                }
            });
        }
        
        // Ejecutar inmediatamente para asegurar visualización
        ensureAnimationsForAllDevices();
        
        // Función para verificar y corregir problemas de visualización
        function checkAndFixAnimationVisibility() {
            const dayAnimation = document.getElementById('welcome-animation-day');
            const nightAnimation = document.getElementById('welcome-animation-night');
            
            [dayAnimation, nightAnimation].forEach(animation => {
                if (animation) {
                    const computedStyle = window.getComputedStyle(animation);
                    
                    // Verificar si está oculta incorrectamente
                    if (computedStyle.display === 'none' || 
                        computedStyle.visibility === 'hidden' || 
                        parseFloat(computedStyle.opacity) === 0) {
                        
                        // Forzar visualización
                        animation.style.setProperty('display', 'flex', 'important');
                        animation.style.setProperty('visibility', 'visible', 'important');
                        animation.style.setProperty('opacity', '1', 'important');
                        animation.style.setProperty('z-index', '99999', 'important');
                    }
                }
            });
        }
        
        // Verificar múltiples veces para asegurar visualización
        setTimeout(checkAndFixAnimationVisibility, 100);
        setTimeout(checkAndFixAnimationVisibility, 500);
        setTimeout(checkAndFixAnimationVisibility, 1000);
        setTimeout(checkAndFixAnimationVisibility, 2000);
        
        // Función para compatibilidad con diferentes navegadores
        function ensureCrossBrowserCompatibility() {
            const dayAnimation = document.getElementById('welcome-animation-day');
            const nightAnimation = document.getElementById('welcome-animation-night');
            
            [dayAnimation, nightAnimation].forEach(animation => {
                if (animation) {
                    // Métodos específicos para diferentes navegadores
                    animation.style.display = 'flex';
                    animation.style.visibility = 'visible';
                    animation.style.opacity = '1';
                    animation.style.zIndex = '99999';
                    
                    // WebKit específico
                    animation.style.webkitDisplay = 'flex';
                    animation.style.webkitVisibility = 'visible';
                    animation.style.webkitOpacity = '1';
                    animation.style.webkitZIndex = '99999';
                    
                    // Mozilla específico
                    animation.style.mozDisplay = 'flex';
                    animation.style.mozVisibility = 'visible';
                    animation.style.mozOpacity = '1';
                    animation.style.mozZIndex = '99999';
                    
                    // MS específico
                    animation.style.msDisplay = 'flex';
                    animation.style.msVisibility = 'visible';
                    animation.style.msOpacity = '1';
                    animation.style.msZIndex = '99999';
                }
            });
        }
        
        // Ejecutar compatibilidad cross-browser
        ensureCrossBrowserCompatibility();
        setTimeout(ensureCrossBrowserCompatibility, 100);
        setTimeout(ensureCrossBrowserCompatibility, 500);
        
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
            
            // Asegurar que las animaciones se muestren correctamente después del cambio de tema
            setTimeout(ensureAnimationsForAllDevices, 100);
            setTimeout(checkAndFixAnimationVisibility, 200);
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