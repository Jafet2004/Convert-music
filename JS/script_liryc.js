// Inicializar jsPDF
const { jsPDF } = window.jspdf;

// Variables globales
const searchHistory = JSON.parse(localStorage.getItem('lyricsSearchHistory')) || [];
let favoriteSongs = JSON.parse(localStorage.getItem('favoriteSongs')) || [];
let player = null;
let currentSong = null;
let isPlayerInitialized = false;

// Configuración de API
const API_CONFIG = {
    lyrics: {
        baseUrl: 'https://api.lyrics.ovh/v1',
        suggestUrl: 'https://api.lyrics.ovh/suggest',
        proxyUrl: 'https://api.allorigins.win/get?url='
    },
    youtube: {
        apiKey: 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac',
        videoUrl: 'https://www.googleapis.com/youtube/v3/videos',
        searchUrl: 'https://www.googleapis.com/youtube/v3/search'
    }
};

// Patrones para limpieza de títulos
const TITLE_CLEAN_PATTERNS = [
    /\(official\s*(video|music\s*video|audio)\)/i,
    /\[official\s*(video|music\s*video|audio)\]/i,
    /official\s*(video|music\s*video|audio)/i,
    /\(lyrics\)/i,
    /\[lyrics\]/i,
    /lyrics/i,
    /\([0-9]{4}\)/,
    /ft\.? .*$/i,
    /feat\.? .*$/i,
    /with .*$/i,
    /vs\.? .*$/i
];

document.addEventListener('DOMContentLoaded', function () {
    // Cache de elementos del DOM
    const DOM = {
        searchBtn: document.getElementById('searchBtn'),
        artistInput: document.getElementById('artist'),
        titleInput: document.getElementById('title'),
        resultsDiv: document.getElementById('results'),
        clearButtons: document.querySelectorAll('.clear-input')
    };

    // Mostrar historial al cargar
    showSearchHistory();

    // Event listeners
    DOM.searchBtn.addEventListener('click', searchLyrics);
    DOM.artistInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchLyrics());
    DOM.titleInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchLyrics());

    // Configurar botones de limpiar
    DOM.clearButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).value = '';
            this.style.opacity = '0';
            document.getElementById(targetId).focus();
        });
    });

    // Mostrar/ocultar botones de limpiar según contenido
    ['artist', 'title'].forEach(id => {
        const input = document.getElementById(id);
        const clearBtn = document.querySelector(`.clear-input[data-target="${id}"]`);

        input.addEventListener('input', function () {
            clearBtn.style.opacity = this.value ? '1' : '0';
        });
    });

    // Función principal de búsqueda
    async function searchLyrics() {
        const artist = DOM.artistInput.value.trim();
        let title = DOM.titleInput.value.trim();

        if (!artist && !title) {
            showError('Por favor ingresa al menos un artista o una canción');
            return;
        }

        showLoading();
        resetPlayer();

        // Verificar si es una URL de YouTube
        const youtubeUrlMatch = title.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (youtubeUrlMatch && youtubeUrlMatch[1]) {
            await getVideoInfoAndSearchLyrics(youtubeUrlMatch[1]);
            return;
        }

        currentSong = { artist, title };
        addToHistory(artist, title);

        try {
            if (artist && title) {
                await searchLyricsApi(artist, title);
            } else if (artist) {
                await searchArtistTracks(artist, true);
            } else {
                await searchSongsByTitle(title);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            showError('Ocurrió un error durante la búsqueda');
        }
    }

    // Obtener información del video y buscar letra
    async function getVideoInfoAndSearchLyrics(videoId) {
        try {
            const url = `${API_CONFIG.youtube.videoUrl}?part=snippet&id=${videoId}&key=${API_CONFIG.youtube.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('No se pudo obtener información del video');
            
            const data = await response.json();
            if (!data.items || data.items.length === 0) {
                throw new Error('Video no encontrado');
            }

            const videoInfo = data.items[0].snippet;
            let title = cleanVideoTitle(videoInfo.title);
            const artist = videoInfo.channelTitle;

            currentSong = { artist, title };
            addToHistory(artist, title);

            await searchLyricsApi(artist, title, videoId);
        } catch (error) {
            console.error('Error al obtener información del video:', error);
            showError('No se pudo obtener información del video de YouTube');
        }
    }

    // Limpiar el título del video
    function cleanVideoTitle(title) {
        let cleanedTitle = title;
        TITLE_CLEAN_PATTERNS.forEach(pattern => {
            cleanedTitle = cleanedTitle.replace(pattern, '');
        });

        // Limpiar caracteres extraños y espacios múltiples
        cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
        cleanedTitle = cleanedTitle.replace(/[^\w\s()\-&]/g, '');

        return cleanedTitle;
    }

    // Buscar letras en la API
    async function searchLyricsApi(artist, title, videoId = null) {
        try {
            const url = `${API_CONFIG.lyrics.baseUrl}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
            const response = await fetch(API_CONFIG.lyrics.proxyUrl + encodeURIComponent(url));
            
            if (!response.ok) throw new Error('No se pudo obtener la letra');
            
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.error) {
                await showVideoAndSuggestions(artist, title, videoId);
            } else {
                if (!videoId) {
                    await searchYoutubeVideo(artist, title, content.lyrics);
                } else {
                    displayResults(artist, title, content.lyrics, videoId, true);
                }
            }
        } catch (error) {
            console.error('Error al buscar letra:', error);
            await showVideoAndSuggestions(artist, title, videoId);
        }
    }

    // Mostrar video y sugerencias
    async function showVideoAndSuggestions(artist, title, videoId = null) {
        if (videoId) {
            displayVideoOnly(artist, title, videoId);
        } else {
            await searchYoutubeVideo(artist, title);
        }

        if (artist) {
            await searchArtistTracks(artist, false);
        } else {
            await searchSongsByTitle(title);
        }
    }

    // Buscar video en YouTube
    async function searchYoutubeVideo(artist, title, lyrics = null, callback = null) {
        try {
            const query = artist ? `${artist} ${title}` : title;
            const url = `${API_CONFIG.youtube.searchUrl}?part=snippet&q=${encodeURIComponent(query)}&key=${API_CONFIG.youtube.apiKey}&maxResults=1`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('No se pudo obtener el video de YouTube');
            
            const data = await response.json();
            const videoId = data.items?.[0]?.id?.videoId || '';

            if (lyrics) {
                displayResults(artist, title, lyrics, videoId);
            } else {
                displayVideoOnly(artist, title, videoId);
                if (callback) callback();
            }
        } catch (error) {
            console.error('Error al buscar el video:', error);
            if (lyrics) {
                displayResults(artist, title, lyrics);
            } else {
                displayVideoOnly(artist, title);
                if (callback) callback();
            }
        }
    }

    // Mostrar solo el video
    function displayVideoOnly(artist, title, videoId, callback = null) {
        const videoEmbed = videoId ? `
            <div class="video-section">
                <div class="video-container">
                    <div id="player"></div>
                </div>
                <button id="playBtn" class="play-btn">
                    <i class="fas fa-play"></i> Reproducir
                    <span class="pulse-animation"></span>
                </button>
            </div>
        ` : '<p class="error-message">No se encontró el video de esta canción</p>';

        DOM.resultsDiv.innerHTML = `
            <div class="lyrics-container">
                <div class="song-info">
                    <div>
                        <h2 class="song-title">${title}</h2>
                        <h3 class="artist-name">${artist}</h3>
                    </div>
                    <div class="action-buttons">
                        <button id="saveFavoriteBtn" class="favorite-btn">
                            ${isSongFavorite(artist, title) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'} Favorito
                        </button>
                    </div>
                </div>
                ${videoEmbed}
                <div class="lyrics">
                    <p class="error-message">No se encontró la letra para esta canción.</p>
                </div>
            </div>
        `;

        if (videoId) {
            initializePlayer(videoId);
        }

        setupFavoriteButton(artist, title);

        if (callback) callback();
    }

    // Mostrar resultados completos
    function displayResults(artist, title, lyrics, videoId, isFromYoutubeUrl = false) {
        const videoEmbed = videoId ? `
            <div class="video-section">
                <div class="video-container">
                    <div id="player"></div>
                </div>
                <button id="playBtn" class="play-btn">
                    <i class="fas fa-play"></i> Reproducir
                    <span class="pulse-animation"></span>
                </button>
            </div>
        ` : '';

        const formattedLyrics = formatLyrics(lyrics);
        const youtubeSourceInfo = isFromYoutubeUrl ? `
            <div class="youtube-source-info">
                <i class="fab fa-youtube"></i>
                <span>Información obtenida desde YouTube</span>
            </div>
        ` : '';

        DOM.resultsDiv.innerHTML = `
            <div class="lyrics-container">
                ${youtubeSourceInfo}
                <div class="song-info">
                    <div>
                        <h2 class="song-title">${title}</h2>
                        <h3 class="artist-name">${artist}</h3>
                    </div>
                    <div class="action-buttons">
                        <button id="saveFavoriteBtn" class="favorite-btn">
                            ${isSongFavorite(artist, title) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'} Favorito
                        </button>
                        <button id="downloadBtn" class="download-btn">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
                ${videoEmbed}
                <div class="lyrics-content">
                    ${formattedLyrics}
                </div>
                <div class="lyrics-footer-actions">
                    <button id="copyLyricsBtn" class="copy-lyrics-btn">
                        <i class="fas fa-copy"></i> Copiar letra
                    </button>
                    <div class="dropdown">
                        <button class="share-btn dropdown-toggle" type="button" id="shareDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-share-alt"></i> Compartir letra
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="shareDropdown">
                            <li><a class="dropdown-item" href="#" id="copyLinkBtn"><i class="fas fa-link"></i> Copiar enlace</a></li>
                            <li><a class="dropdown-item" href="#" id="shareWhatsAppBtn"><i class="fab fa-whatsapp"></i> WhatsApp</a></li>
                            <li><a class="dropdown-item" href="#" id="shareFacebookBtn"><i class="fab fa-facebook"></i> Facebook</a></li>
                            <li><a class="dropdown-item" href="#" id="shareTwitterBtn"><i class="fab fa-twitter"></i> Twitter</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Configurar botones interactivos
        document.getElementById('copyLyricsBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(lyrics).then(() => {
                showNotification('Letra copiada al portapapeles');
            }).catch(err => {
                console.error('Error al copiar: ', err);
                showNotification('Error al copiar la letra');
            });
        });

        setupShareButtons(artist, title);

        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            downloadLyricsAsPDF(artist, title, lyrics);
        });

        if (videoId) {
            initializePlayer(videoId);
        }

        setupFavoriteButton(artist, title);
    }

    // Configurar botones de compartir
    function setupShareButtons(artist, title) {
        const currentUrl = encodeURIComponent(window.location.href.split('?')[0] + `?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
        const shareText = encodeURIComponent(`Mira la letra de "${title}" de ${artist}`);

        document.getElementById('copyLinkBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href.split('?')[0] + `?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`).then(() => {
                showNotification('Enlace copiado al portapapeles');
            });
        });

        document.getElementById('shareWhatsAppBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(`https://wa.me/?text=${shareText}%20${currentUrl}`, '_blank');
        });

        document.getElementById('shareFacebookBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, '_blank');
        });

        document.getElementById('shareTwitterBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`, '_blank');
        });
    }

    // Formatear letras
    function formatLyrics(lyrics) {
        return lyrics.replace(/\n/g, '<br>')
            .replace(/\[(.*?)\]/g, '<span class="lyrics-section">$&</span>');
    }

    // Configurar botón de favoritos
    function setupFavoriteButton(artist, title) {
        const favoriteBtn = document.getElementById('saveFavoriteBtn');
        if (!favoriteBtn) return;

        favoriteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            toggleFavorite(artist, title);

            // Actualizar el estado visual del botón
            if (this.classList.contains('is-favorite')) {
                this.innerHTML = '<i class="far fa-heart"></i> Favorito';
                this.classList.remove('is-favorite');
                showNotification('Eliminado de favoritos');
            } else {
                this.innerHTML = '<i class="fas fa-heart"></i> Favorito';
                this.classList.add('is-favorite');
                showNotification('Agregado a favoritos');
            }

            // Actualizar la lista de favoritos en el historial si está visible
            if (document.querySelector('.favorites-section')) {
                showSearchHistory();
            }
        });

        // Estado inicial del botón
        if (isSongFavorite(artist, title)) {
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorito';
            favoriteBtn.classList.add('is-favorite');
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favorito';
            favoriteBtn.classList.remove('is-favorite');
        }
    }

    // Verificar si una canción está en favoritos
    function isSongFavorite(artist, title) {
        return favoriteSongs.some(song =>
            song.artist.toLowerCase() === artist.toLowerCase() &&
            song.title.toLowerCase() === title.toLowerCase()
        );
    }

    // Alternar favorito
    function toggleFavorite(artist, title) {
        const index = favoriteSongs.findIndex(song =>
            song.artist.toLowerCase() === artist.toLowerCase() &&
            song.title.toLowerCase() === title.toLowerCase()
        );

        if (index === -1) {
            favoriteSongs.push({ artist, title });
        } else {
            favoriteSongs.splice(index, 1);
        }

        localStorage.setItem('favoriteSongs', JSON.stringify(favoriteSongs));
    }

    // Historial de búsquedas
    function addToHistory(artist, title) {
        const entry = { artist, title, date: new Date().toISOString() };

        // Evitar duplicados
        const isDuplicate = searchHistory.some(item =>
            item.artist.toLowerCase() === artist.toLowerCase() &&
            item.title.toLowerCase() === title.toLowerCase()
        );

        if (!isDuplicate) {
            searchHistory.unshift(entry);
            // Mantener solo las últimas 10 búsquedas
            if (searchHistory.length > 10) searchHistory.pop();
            localStorage.setItem('lyricsSearchHistory', JSON.stringify(searchHistory));
            showSearchHistory();
        }
    }

    function showSearchHistory() {
        if (searchHistory.length === 0 && favoriteSongs.length === 0) {
            DOM.resultsDiv.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <i class="fas fa-search"></i>
                        <h3>Busca letras de canciones</h3>
                        <p>Comienza escribiendo el nombre del artista o canción</p>
                    </div>
                </div>
            `;
            return;
        }

        const historyHTML = `
            <div class="search-history">
                ${searchHistory.length > 0 ? `
                    <div class="history-header">
                        <h3>Historial de búsquedas</h3>
                        <button id="clearHistory" class="clear-history-btn">Limpiar historial</button>
                    </div>
                    <ul class="history-list">
                        ${searchHistory.map(item => `
                            <li onclick="searchTrack('${item.artist.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}')">
                                <span class="history-item">
                                    <span class="history-title">${item.title}</span>
                                    <span class="history-artist">${item.artist}</span>
                                </span>
                                <i class="fas fa-chevron-right"></i>
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                <div class="favorites-section">
                    <h3>Mis Favoritos</h3>
                    ${favoriteSongs.length > 0 ? `
                        <ul class="favorites-list">
                            ${favoriteSongs.map(item => `
                                <li onclick="searchTrack('${item.artist.replace(/'/g, "\\'")}', '${item.title.replace(/'/g, "\\'")}')">
                                    <span class="favorite-item">
                                        <i class="fas fa-heart"></i>
                                        <span class="favorite-title">${item.title}</span>
                                        <span class="favorite-artist">${item.artist}</span>
                                    </span>
                                    <i class="fas fa-chevron-right"></i>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="no-favorites">No tienes canciones favoritas aún</p>'}
                </div>
            </div>
        `;

        const historyContainer = document.createElement('div');
        historyContainer.innerHTML = historyHTML;
        DOM.resultsDiv.innerHTML = '';
        DOM.resultsDiv.appendChild(historyContainer);

        // Agregar evento para limpiar historial
        document.getElementById('clearHistory')?.addEventListener('click', clearHistory);
    }

    function clearHistory() {
        searchHistory.length = 0;
        localStorage.removeItem('lyricsSearchHistory');
        showSearchHistory();
        showNotification('Historial limpiado');
    }

    // Mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 10);
    }

    // Inicializar el reproductor de YouTube
    function initializePlayer(videoId) {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = function () {
                createPlayer(videoId);
            };
        } else {
            createPlayer(videoId);
        }
    }

    // Crear el reproductor de YouTube
    function createPlayer(videoId) {
        if (player) {
            player.destroy();
        }

        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: videoId,
            playerVars: {
                'autoplay': 0,
                'controls': 1,
                'rel': 0,
                'enablejsapi': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });

        isPlayerInitialized = true;
    }

    // Cuando el reproductor está listo
    function onPlayerReady(event) {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', function () {
                togglePlayPause(event);
            });
        }
    }

    // Cambiar estado del reproductor
    function onPlayerStateChange(event) {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;

        if (event.data === YT.PlayerState.PLAYING) {
            playBtn.classList.add('playing');
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i> Reproducir <span class="pulse-animation"></span>';
        }
    }

    // Alternar play/pause
    function togglePlayPause(event) {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;

        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            event.target.pauseVideo();
        } else {
            event.target.playVideo();
        }
    }

    // Resetear el reproductor
    function resetPlayer() {
        if (player) {
            player.destroy();
            player = null;
            isPlayerInitialized = false;
        }
    }

    // Buscar canciones de un artista
    async function searchArtistTracks(artist, isPrimarySearch = false) {
        try {
            const url = `${API_CONFIG.lyrics.suggestUrl}/${encodeURIComponent(artist)}`;
            const response = await fetch(API_CONFIG.lyrics.proxyUrl + encodeURIComponent(url));
            
            if (!response.ok) throw new Error('No se pudieron obtener las canciones del artista');
            
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.data && content.data.length > 0) {
                if (isPrimarySearch) {
                    displayArtistResults(artist, content.data);
                } else {
                    displaySuggestions(artist, content.data);
                }
            } else if (isPrimarySearch) {
                showError(`No se encontraron canciones para ${artist}`);
            }
        } catch (error) {
            console.error('Error al buscar canciones del artista:', error);
            if (isPrimarySearch) showError('Error al buscar canciones del artista');
        }
    }

    function displayArtistResults(artist, tracks) {
        const limitedTracks = tracks.slice(0, 15);
        let tracksHTML = `
            <div class="artist-results">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2>Canciones de ${artist}</h2>
                    <button id="backToSearch" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                </div>
                <p>Selecciona una canción para ver su letra:</p>
                <ul class="track-list">
        `;

        limitedTracks.forEach(track => {
            tracksHTML += `
                <li onclick="searchTrack('${track.artist.name.replace(/'/g, "\\'")}', '${track.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-play-circle"></i> ${track.title}
                    <span class="badge bg-secondary">${track.artist.name}</span>
                </li>
            `;
        });

        tracksHTML += `</ul></div>`;
        DOM.resultsDiv.innerHTML = tracksHTML;

        document.getElementById('backToSearch')?.addEventListener('click', () => {
            DOM.artistInput.focus();
        });
    }

    function displaySuggestions(artist, tracks) {
        const limitedTracks = tracks.slice(0, 6);
        let suggestionsHTML = `
            <div class="suggestions">
                <h3>Otras canciones de ${artist}</h3>
                <div class="suggestion-list">
        `;

        limitedTracks.forEach(track => {
            suggestionsHTML += `
                <div class="suggestion-item" onclick="searchTrack('${track.artist.name.replace(/'/g, "\\'")}', '${track.title.replace(/'/g, "\\'")}')">
                    <div class="suggestion-title">${track.title}</div>
                    <div class="suggestion-artist">${track.artist.name}</div>
                </div>
            `;
        });

        suggestionsHTML += `</div></div>`;

        // Agregar las sugerencias al final del contenido existente
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.innerHTML = suggestionsHTML;
        DOM.resultsDiv.appendChild(suggestionsContainer);
    }

    // Buscar canciones por título
    async function searchSongsByTitle(title) {
        try {
            const url = `${API_CONFIG.lyrics.suggestUrl}/${encodeURIComponent(title)}`;
            const response = await fetch(API_CONFIG.lyrics.proxyUrl + encodeURIComponent(url));
            
            if (!response.ok) throw new Error('No se pudieron encontrar canciones con ese título');
            
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.data && content.data.length > 0) {
                displaySongResults(title, content.data);
            } else {
                showError(`No se encontraron canciones con el título "${title}"`);
            }
        } catch (error) {
            console.error('Error al buscar canciones:', error);
            showError('Error al buscar canciones');
        }
    }

    function displaySongResults(title, songs) {
        const limitedSongs = songs.slice(0, 15);
        let songsHTML = `
            <div class="song-results">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2>Canciones que coinciden con "${title}"</h2>
                    <button id="backToSearch" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                </div>
                <p>Selecciona una canción para ver su letra:</p>
                <div class="songs-list">
        `;

        limitedSongs.forEach(song => {
            songsHTML += `
                <div class="song-item" onclick="searchTrack('${song.artist.name.replace(/'/g, "\\'")}', '${song.title.replace(/'/g, "\\'")}')">
                    <div class="song-item-info">
                        <div class="song-item-title"><i class="fas fa-play-circle"></i> ${song.title}</div>
                        <div class="song-item-artist">${song.artist.name}</div>
                    </div>
                    <div><i class="fas fa-chevron-right"></i></div>
                </div>
            `;
        });

        songsHTML += `</div></div>`;
        DOM.resultsDiv.innerHTML = songsHTML;

        document.getElementById('backToSearch')?.addEventListener('click', () => {
            DOM.titleInput.focus();
        });
    }

    // Descargar letras como PDF
    function downloadLyricsAsPDF(artist, title, lyrics) {
        try {
            const doc = new jsPDF();

            // Configuración del documento
            doc.setProperties({
                title: `${title} - ${artist}`,
                subject: 'Letra de canción',
                author: 'ConvertMusic'
            });

            // Encabezado
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text(title, 105, 20, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(16);
            doc.setTextColor(100, 100, 100);
            doc.text(artist, 105, 30, { align: 'center' });

            // Configuración para texto en dos columnas
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const columnWidth = (pageWidth - 3 * margin) / 2;
            let yPos = 45;
            let currentColumn = 0;

            // Procesar la letra
            const formattedLyrics = lyrics.replace(/\[(.*?)\]/g, '\n$&\n');
            const lines = formattedLyrics.split('\n');

            // Función para agregar texto a una columna
            const addTextToColumn = (text, column) => {
                const xPos = margin + (column * (columnWidth + margin));
                const textLines = doc.splitTextToSize(text, columnWidth);

                doc.setFontSize(12);
                doc.setTextColor(20, 20, 20);

                // Manejar secciones especiales (como [Coro])
                const isSection = text.match(/^\[.*\]$/);
                if (isSection) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(50, 50, 150);
                }

                doc.text(textLines, xPos, yPos);

                if (isSection) {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(20, 20, 20);
                }

                yPos += textLines.length * 7; // Ajustar espacio entre líneas
            };

            // Distribuir el texto en columnas
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Cambiar de columna si el texto no cabe
                if (yPos > doc.internal.pageSize.getHeight() - 20) {
                    yPos = 45;
                    currentColumn++;

                    // Si ambas columnas están llenas, agregar nueva página
                    if (currentColumn > 1) {
                        doc.addPage();
                        yPos = 45;
                        currentColumn = 0;
                    }
                }

                addTextToColumn(line, currentColumn);
            }

            // Sanitizar nombre de archivo
            const safeFilename = `${artist} - ${title}`.replace(/[<>:"\/\\|?*]/g, '');

            // Guardar el PDF
            doc.save(`${safeFilename}.pdf`);

            // Mostrar notificación después de guardar
            setTimeout(() => {
                showNotification('Letra descargada como PDF');
            }, 500);

        } catch (error) {
            console.error('Error al generar PDF:', error);
            showNotification('Error al generar el PDF');
        }
    }

    // Mostrar estado de carga
    function showLoading() {
        DOM.resultsDiv.innerHTML = `
            <div class="loading">
                <div class="loading-spinner">
                    <i class="fas fa-compact-disc fa-spin"></i>
                </div>
                <p>Buscando...</p>
            </div>
        `;
    }

    // Mostrar mensaje de error
    function showError(message) {
        let errorMessage = message;

        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            errorMessage = 'Servidor no disponible. Por favor, verifica tu conexión a internet o intenta nuevamente más tarde.';
        }

        DOM.resultsDiv.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p>${errorMessage}</p>
                <button onclick="window.location.reload()" class="retry-btn">
                    <i class="fas fa-sync-alt"></i> Intentar nuevamente
                </button>
            </div>
        `;
    }
});

// Función global para buscar desde la lista de canciones
window.searchTrack = function (artist, title) {
    document.getElementById('artist').value = artist;
    document.getElementById('title').value = title;
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.querySelector('#searchBtn').click();
};