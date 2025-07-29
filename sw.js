const CACHE_NAME = 'music-player-v1';
const CACHE_URLS = [
  './',
  './CSS/style_repro.css',
  './JS/repro.js',
  './JS/dark_mode.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
  );
});

// Estrategia Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Manejar mensajes de la aplicación
self.addEventListener('message', event => {
  if (event.data.type === 'BACKGROUND_PLAYBACK') {
    // Mantener la reproducción en segundo plano
    handleBackgroundPlayback(event.data);
  }
});

// Manejar reproducción en segundo plano
function handleBackgroundPlayback(data) {
  if (data.track) {
    // Puedes usar la API de Background Fetch o Notifications aquí
    self.registration.showNotification('Reproduciendo en segundo plano', {
      body: `${data.track.title} - ${data.track.artist}`,
      icon: data.track.thumbnail,
      silent: true
    });
  }
}