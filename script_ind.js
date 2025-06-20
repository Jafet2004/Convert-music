// Función para manejar cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

// Control de la animación de bienvenida
window.addEventListener('load', () => {
    const welcomeAnimation = document.getElementById('welcome-animation');
    const lastVisit = getCookie('lastVisit');
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 semana en milisegundos
    
    // Si es la primera visita o ha pasado más de una semana desde la última visita
    if (!lastVisit || (now - parseInt(lastVisit)) > oneWeek) {
        // Mostrar animación
        welcomeAnimation.style.display = 'flex';
        
        setTimeout(() => {
            welcomeAnimation.style.opacity = '0';
            setTimeout(() => {
                welcomeAnimation.style.display = 'none';
            }, 1000);
        }, 2500);
        
        // Guardar la fecha de esta visita
        setCookie('lastVisit', now.toString(), 30); // Cookie válida por 30 días
    } else {
        // No mostrar animación
        welcomeAnimation.style.display = 'none';
    }
});