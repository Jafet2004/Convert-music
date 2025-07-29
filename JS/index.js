document.addEventListener('DOMContentLoaded', function() {
            // Función para determinar si es día o noche
            function isDayTime() {
                const hour = new Date().getHours();
                return hour >= 6 && hour < 18; // Día: 6 AM - 6 PM
            }

            // Función para obtener el saludo según la hora
            function getGreeting() {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 12) {
                    return "¡Buenos días! Bienvenido a Convert Music";
                } else if (hour >= 12 && hour < 18) {
                    return "¡Buenas tardes! Bienvenido a Convert Music";
                } else {
                    return "¡Buenas noches! Bienvenido a Convert Music";
                }
            }

            // Detectar si es dispositivo móvil
            function isMobileDevice() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       window.innerWidth <= 768;
            }

            // Mostrar la animación correspondiente
            function showWelcomeAnimation() {
                const dayAnimation = document.getElementById('welcome-animation-day');
                const nightAnimation = document.getElementById('welcome-animation-night');
                const dayText = document.getElementById('day-welcome-text');
                const nightText = document.getElementById('night-welcome-text');
                
                const greeting = getGreeting();
                
                if (isDayTime()) {
                    dayAnimation.style.display = 'flex';
                    nightAnimation.style.display = 'none';
                    dayText.textContent = greeting;
                } else {
                    dayAnimation.style.display = 'none';
                    nightAnimation.style.display = 'flex';
                    nightText.textContent = greeting;
                }

                // Ajustar duración de animación para móviles
                const animationDuration = isMobileDevice() ? 2500 : 3000;

                // Ocultar animación después del tiempo especificado
                setTimeout(() => {
                    dayAnimation.style.opacity = '0';
                    nightAnimation.style.opacity = '0';
                    setTimeout(() => {
                        dayAnimation.style.display = 'none';
                        nightAnimation.style.display = 'none';
                    }, 800);
                }, animationDuration);
            }

            // Iniciar animación de bienvenida
            showWelcomeAnimation();

            // 1. Simulación de afinador con soporte táctil mejorado
            const tunerCards = document.querySelectorAll('.tuner-card');
            tunerCards.forEach(card => {
                const noteDisplay = card.querySelector('.tuner-note-preview');
                const needle = card.querySelector('.tuner-needle-preview');
                const accuracyMarker = card.querySelector('.tuner-accuracy-marker');
                const statusDisplay = card.querySelector('.tuner-status-preview');
                const strings = card.querySelectorAll('.tuner-string-preview');

                let isAnimating = false;

                const handleTunerInteraction = (event) => {
                    event.preventDefault();
                    
                    // Prevenir múltiples activaciones simultáneas
                    if (isAnimating) return;
                    isAnimating = true;

                    const note = event.currentTarget.querySelector('.tuner-string-note').textContent;
                    noteDisplay.textContent = note;
                    noteDisplay.classList.remove('tuner-in-tune');

                    const randomOffset = (Math.random() * 100 - 50);
                    const needlePosition = 50 + (randomOffset / 50 * 25);
                    needle.style.transform = `translateX(-50%) translateX(${Math.min(Math.max(needlePosition - 50, -40), 40)}px)`;

                    const accuracyPosition = 50 + (randomOffset / 50 * 25);
                    accuracyMarker.style.left = `${Math.min(Math.max(accuracyPosition, 5), 95)}%`;

                    if (Math.abs(randomOffset) < 5) {
                        accuracyMarker.style.backgroundColor = 'var(--correct-color)';
                        statusDisplay.textContent = 'Perfectamente afinado!';
                        noteDisplay.classList.add('tuner-in-tune');
                    } else if (Math.abs(randomOffset) < 20) {
                        accuracyMarker.style.backgroundColor = 'var(--close-color)';
                        statusDisplay.textContent = randomOffset > 0 ? 'Un poco alto, baja la tensión' : 'Un poco bajo, sube la tensión';
                    } else {
                        accuracyMarker.style.backgroundColor = 'var(--far-color)';
                        statusDisplay.textContent = randomOffset > 0 ? 'Muy alto, baja la tensión' : 'Muy bajo, sube la tensión';
                    }

                    // Resetear el flag después de un delay
                    setTimeout(() => {
                        isAnimating = false;
                    }, 300);
                };

                // Agregar eventos táctiles y de mouse con mejor manejo
                strings.forEach(string => {
                    // Evento de mouse para desktop
                    string.addEventListener('mouseenter', handleTunerInteraction);
                    
                    // Eventos táctiles para móviles
                    string.addEventListener('touchstart', handleTunerInteraction, { passive: false });
                    string.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
                    
                    // Prevenir zoom en dispositivos táctiles
                    string.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
                });
            });

            // 2. Sistema de autenticación mejorado con optimizaciones móviles
            const userBtn = document.getElementById('userBtn');
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const showRegisterForm = document.getElementById('showRegisterForm');
            const showLoginForm = document.getElementById('showLoginForm');
            const welcomeMessage = document.getElementById('welcome-message');
            const welcomeText = document.getElementById('welcome-text');

            // Función para verificar si es usuario admin (por correo)
            function isAdmin(email) {
                return email === 'jafetalexander58@gmail.com';
            }

            // Función para crear objeto de usuario admin
            function createAdminUser() {
                return {
                    firstName: 'Jafet',
                    lastName: 'Aguilar',
                    username: 'TH3B4R4K',
                    email: 'jafetalexander58@gmail.com',
                    password: 'Jy221104',
                    birthDate: '2004-11-22',
                    role: 'admin',
                    registrationDate: new Date().toISOString()
                };
            }

            // Manejar registro de usuarios normales
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const userData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    birthDate: document.getElementById('birthDate').value,
                    password: document.getElementById('password').value,
                    role: isAdmin(document.getElementById('email').value) ? 'admin' : 'user',
                    registrationDate: new Date().toISOString()
                };

                // Validar que no se registre otro usuario con el correo admin
                if (isAdmin(userData.email) && userData.username !== 'TH3B4R4K') {
                    alert('Este correo electrónico no está disponible para registro.');
                    return;
                }

                let users = JSON.parse(localStorage.getItem('users')) || [];
                
                if (users.some(user => user.username === userData.username)) {
                    alert('Este nombre de usuario ya está registrado.');
                    return;
                }

                if (users.some(user => user.email === userData.email)) {
                    alert('Este correo electrónico ya está registrado.');
                    return;
                }

                users.push(userData);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(userData));

                showWelcomeMessage(`Bienvenido, ${userData.firstName}!`);
                loginModal.hide();
                updateUserButton(userData);
                resetForms();
                
                // Delay optimizado para móviles
                const redirectDelay = isMobileDevice() ? 800 : 1000;
                setTimeout(() => {
                    window.location.href = userData.role === 'admin' ? 'gestionAd.html' : 'perfil.html';
                }, redirectDelay);
            });

            // Manejar login - Versión mejorada
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.username === username && u.password === password);

                if (!user) {
                    alert('Credenciales incorrectas. Inténtalo de nuevo.');
                    return;
                }

                localStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('justLoggedIn', 'true');
                showWelcomeMessage(`Bienvenido de nuevo, ${user.firstName}!`);
                loginModal.hide();
                updateUserButton(user);
                resetForms();
                
                // Delay optimizado para móviles
                const redirectDelay = isMobileDevice() ? 500 : 300;
                await new Promise(resolve => setTimeout(resolve, redirectDelay));
                
                if (isAdmin(user.email)) {
                    window.location.href = 'gestionAd.html';
                } else {
                    window.location.href = 'perfil.html';
                }
            });

            // Funciones auxiliares
            function showWelcomeMessage(message) {
                if (welcomeText && welcomeMessage) {
                    welcomeText.textContent = message;
                    welcomeMessage.style.display = 'block';
                    
                    // Ajustar posición para móviles
                    if (isMobileDevice()) {
                        welcomeMessage.style.top = '10px';
                        welcomeMessage.style.right = '10px';
                        welcomeMessage.style.left = '10px';
                    }
                    
                    setTimeout(() => {
                        welcomeMessage.style.display = 'none';
                    }, 3000);
                }
            }

            function updateUserButton(userData) {
                if (!userBtn) return;
                
                if (userData) {
                    // Mostrar nombre completo en desktop, solo iniciales en móvil
                    const displayName = isMobileDevice() ? userData.firstName.charAt(0) : userData.firstName;
                    const displayClass = isMobileDevice() ? '' : 'd-none d-lg-inline';
                    
                    userBtn.innerHTML = `<i class="fas fa-user-check me-1"></i><span class="${displayClass}">${displayName}</span>`;
                    userBtn.onclick = function(e) {
                        e.preventDefault();
                        if (isAdmin(userData.email)) {
                            window.location.href = 'gestionAd.html';
                        } else {
                            window.location.href = 'perfil.html';
                        }
                    };
                } else {
                    const displayText = isMobileDevice() ? '' : 'Iniciar Sesión';
                    const displayClass = isMobileDevice() ? '' : 'd-none d-lg-inline';
                    
                    userBtn.innerHTML = `<i class="fas fa-user me-1"></i><span class="${displayClass}">${displayText}</span>`;
                    userBtn.onclick = function(e) {
                        e.preventDefault();
                        loginModal.show();
                    };
                }
            }

            function resetForms() {
                loginForm.reset();
                registerForm.reset();
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            }

            // Inicialización del admin si no existe
            function initializeAdminUser() {
                try {
                    let users = JSON.parse(localStorage.getItem('users')) || [];
                    const adminExists = users.some(u => isAdmin(u.email));
                    
                    if (!adminExists) {
                        const adminUser = createAdminUser();
                        users.push(adminUser);
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                } catch (e) {
                    console.error('Error al inicializar admin:', e);
                    setTimeout(initializeAdminUser, 1000);
                }
            }

            // Verificar sesión al cargar
            async function checkCurrentSession() {
                try {
                    // Delay optimizado para móviles
                    const checkDelay = isMobileDevice() ? 500 : 300;
                    await new Promise(resolve => setTimeout(resolve, checkDelay));
                    
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser) {
                        updateUserButton(currentUser);
                        
                        // Redirigir solo si es admin y viene de login
                        if (isAdmin(currentUser.email) && sessionStorage.getItem('justLoggedIn')) {
                            sessionStorage.removeItem('justLoggedIn');
                            window.location.href = 'gestionAd.html';
                        }
                    } else {
                        updateUserButton(null);
                    }
                } catch (e) {
                    console.error('Error al verificar sesión:', e);
                }
            }

            // Iniciar todo
            initializeAdminUser();
            checkCurrentSession();

            // Alternar entre formularios
            showRegisterForm.addEventListener('click', function(e) {
                e.preventDefault();
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            });

            showLoginForm.addEventListener('click', function(e) {
                e.preventDefault();
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
            });

            // 3. Optimizaciones adicionales para móviles
            if (isMobileDevice()) {
                // Prevenir zoom en inputs
                const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="date"]');
                inputs.forEach(input => {
                    input.addEventListener('focus', function() {
                        // Scroll suave al input en móviles
                        setTimeout(() => {
                            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    });
                });

                // Mejorar navegación táctil
                const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
                navLinks.forEach(link => {
                    link.addEventListener('touchstart', function() {
                        this.style.transform = 'scale(0.95)';
                    });
                    
                    link.addEventListener('touchend', function() {
                        this.style.transform = 'scale(1)';
                    });
                });

                // Optimizar scroll para móviles
                let isScrolling = false;
                window.addEventListener('scroll', function() {
                    if (!isScrolling) {
                        isScrolling = true;
                        requestAnimationFrame(function() {
                            isScrolling = false;
                        });
                    }
                }, { passive: true });
            }

            // 4. Mejoras de rendimiento general
            // Lazy loading para imágenes si las hubiera
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                observer.unobserve(img);
                            }
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }

            // 5. Manejo mejorado del modal en móviles
            const modalElement = document.getElementById('loginModal');
            if (modalElement) {
                modalElement.addEventListener('shown.bs.modal', function() {
                    if (isMobileDevice()) {
                        // Enfocar el primer input automáticamente en móviles
                        const firstInput = this.querySelector('input');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 100);
                        }
                    }
                });
            }
        });
