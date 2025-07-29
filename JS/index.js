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

    // Mostrar la animación correspondiente
    function showWelcomeAnimation() {
        const dayAnimation = document.getElementById('welcome-animation-day');
        const nightAnimation = document.getElementById('welcome-animation-night');
        const dayText = document.getElementById('day-welcome-text');
        const nightText = document.getElementById('night-welcome-text');
        
        const greeting = getGreeting();
        
        // Asegurar que las animaciones estén visibles inicialmente
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
        
        // Mostrar la animación correspondiente según la hora
        if (isDayTime()) {
            if (dayAnimation) {
                dayAnimation.style.display = 'flex';
                dayAnimation.style.visibility = 'visible';
                dayAnimation.style.opacity = '1';
                if (dayText) dayText.textContent = greeting;
            }
            if (nightAnimation) {
                nightAnimation.style.display = 'none';
            }
        } else {
            if (nightAnimation) {
                nightAnimation.style.display = 'flex';
                nightAnimation.style.visibility = 'visible';
                nightAnimation.style.opacity = '1';
                if (nightText) nightText.textContent = greeting;
            }
            if (dayAnimation) {
                dayAnimation.style.display = 'none';
            }
        }

        // Ocultar animación después de 4 segundos
        setTimeout(() => {
            if (dayAnimation && dayAnimation.style.display === 'flex') {
                dayAnimation.style.opacity = '0';
                dayAnimation.style.transition = 'opacity 0.8s ease';
                setTimeout(() => {
                    dayAnimation.style.display = 'none';
                    dayAnimation.style.visibility = 'hidden';
                }, 800);
            }
            if (nightAnimation && nightAnimation.style.display === 'flex') {
                nightAnimation.style.opacity = '0';
                nightAnimation.style.transition = 'opacity 0.8s ease';
                setTimeout(() => {
                    nightAnimation.style.display = 'none';
                    nightAnimation.style.visibility = 'hidden';
                }, 800);
            }
        }, 4000);
    }

    // Iniciar animación de bienvenida
    showWelcomeAnimation();
    
    // Función simple para ocultar animaciones
    function hideWelcomeAnimations() {
        const dayAnimation = document.getElementById('welcome-animation-day');
        const nightAnimation = document.getElementById('welcome-animation-night');
        
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
    }
    
    // Ocultar animaciones después de 4 segundos
    setTimeout(hideWelcomeAnimations, 4000);
    
    // Función para limpiar completamente las animaciones
    function completelyRemoveAnimations() {
        const dayAnimation = document.getElementById('welcome-animation-day');
        const nightAnimation = document.getElementById('welcome-animation-night');
        
        if (dayAnimation) {
            dayAnimation.remove();
        }
        if (nightAnimation) {
            nightAnimation.remove();
        }
    }
    
    // Ocultar animaciones después de 4 segundos
    setTimeout(hideWelcomeAnimations, 4000);
    


    // 1. Simulación de afinador
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

            setTimeout(() => {
                isAnimating = false;
            }, 300);
        };

        strings.forEach(string => {
            string.addEventListener('mouseenter', handleTunerInteraction);
            string.addEventListener('click', handleTunerInteraction);
            string.addEventListener('touchstart', handleTunerInteraction);
        });
    });

    // 2. Sistema de autenticación
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

    // Manejar registro de usuarios
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
        sessionStorage.setItem('justLoggedIn', 'true');
        
        showWelcomeMessage(`Bienvenido, ${userData.firstName}!`);
        loginModal.hide();
        updateUserButton(userData);
        
        resetForms();
        
        setTimeout(() => {
            window.location.href = userData.role === 'admin' ? 'gestionAd.html' : 'perfil.html';
        }, 1000);
    });

    // Manejar login
    loginForm.addEventListener('submit', function(e) {
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
            
            setTimeout(() => {
                welcomeMessage.style.display = 'none';
            }, 3000);
        }
    }

    function updateUserButton(userData) {
        if (!userBtn) return;
        
        if (userData) {
            userBtn.innerHTML = `<i class="fas fa-user-check me-1"></i><span class="d-none d-lg-inline">${userData.firstName}</span>`;
            userBtn.onclick = function(e) {
                e.preventDefault();
                if (isAdmin(userData.email)) {
                    window.location.href = 'gestionAd.html';
                } else {
                    window.location.href = 'perfil.html';
                }
            };
        } else {
            userBtn.innerHTML = `<i class="fas fa-user me-1"></i><span class="d-none d-lg-inline">Iniciar Sesión</span>`;
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
    function checkCurrentSession() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                updateUserButton(currentUser);
                
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

    // Asegurar que las animaciones CSS se activen
    function forceReflow(element) {
        return element.offsetHeight;
    }
});