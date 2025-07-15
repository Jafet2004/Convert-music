// Inicializar jsPDF
const { jsPDF } = window.jspdf;

// Variables globales
const searchHistory = JSON.parse(localStorage.getItem('lyricsSearchHistory')) || [];
let favoriteSongs = JSON.parse(localStorage.getItem('favoriteSongs')) || [];
let player = null;
let currentSong = null;

document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const searchBtn = document.getElementById('searchBtn');
    const artistInput = document.getElementById('artist');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');

    // Mostrar historial al cargar
    showSearchHistory();

    // Event listeners para búsqueda
    searchBtn.addEventListener('click', searchLyrics);
    artistInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchLyrics());
    titleInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchLyrics());

    // Función principal de búsqueda (modificada)
    function searchLyrics() {
        const artist = artistInput.value.trim();
        let title = titleInput.value.trim();

        if (!artist && !title) {
            showError('Por favor ingresa al menos un artista o una canción');
            return;
        }

        showLoading();
        resetPlayer();

        // Verificar si es una URL de YouTube
        const youtubeUrlMatch = title.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (youtubeUrlMatch && youtubeUrlMatch[1]) {
            const videoId = youtubeUrlMatch[1];
            getVideoInfoAndSearchLyrics(videoId);
            return;
        }

        currentSong = { artist, title };
        addToHistory(artist, title);

        if (artist && title) {
            searchLyricsApi(artist, title);
        } else if (artist) {
            searchArtistTracks(artist, true);
        } else {
            searchSongsByTitle(title);
        }
    }

    // Nueva función para obtener información del video y buscar letra
    function getVideoInfoAndSearchLyrics(videoId) {
        const apiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac';
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('No se pudo obtener información del video');
                return response.json();
            })
            .then(data => {
                if (!data.items || data.items.length === 0) {
                    throw new Error('Video no encontrado');
                }

                const videoInfo = data.items[0].snippet;
                let title = videoInfo.title;
                const artist = videoInfo.channelTitle;

                // Limpiar el título (remover cosas como "Official Video" etc.)
                title = cleanVideoTitle(title);

                currentSong = { artist, title };
                addToHistory(artist, title);

                // Buscar la letra con la información obtenida
                searchLyricsApi(artist, title, videoId);
            })
            .catch(error => {
                console.error('Error al obtener información del video:', error);
                showError('No se pudo obtener información del video de YouTube');
            });
    }

    // Función para limpiar el título del video
    function cleanVideoTitle(title) {
        // Eliminar partes comunes que no son parte del título real de la canción
        const patternsToRemove = [
            /\(official\s*(video|music\s*video|audio)\)/i,
            /\[official\s*(video|music\s*video|audio)\]/i,
            /official\s*(video|music\s*video|audio)/i,
            /\(lyrics\)/i,
            /\[lyrics\]/i,
            /lyrics/i,
            /\([0-9]{4}\)/, // Años entre paréntesis
            /ft\.? .*$/i, // Características de otros artistas
            /feat\.? .*$/i,
            /with .*$/i,
            /vs\.? .*$/i
        ];

        patternsToRemove.forEach(pattern => {
            title = title.replace(pattern, '');
        });

        // Limpiar caracteres extraños y espacios múltiples
        title = title.replace(/\s+/g, ' ').trim();
        title = title.replace(/[^\w\s()\-&]/g, ''); // Mantener solo caracteres alfanuméricos básicos

        return title;
    }

    // Función para buscar letras (modificada para aceptar videoId)
    function searchLyricsApi(artist, title, videoId = null) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) throw new Error('No se pudo obtener la letra');
                return response.json();
            })
            .then(data => {
                try {
                    const content = JSON.parse(data.contents);
                    if (content.error) {
                        showVideoAndSuggestions(artist, title, videoId);
                    } else {
                        // Si no tenemos videoId, buscamos uno
                        if (!videoId) {
                            searchYoutubeVideo(artist, title, content.lyrics);
                        } else {
                            // Si ya tenemos videoId, mostramos directamente
                            displayResults(artist, title, content.lyrics, videoId, true);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing lyrics:', e);
                    showVideoAndSuggestions(artist, title, videoId);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showVideoAndSuggestions(artist, title, videoId);
            });
    }

    // Función para mostrar video y sugerencias (modificada para aceptar videoId)
    function showVideoAndSuggestions(artist, title, videoId = null) {
        if (videoId) {
            // Si ya tenemos videoId, mostramos directamente
            displayVideoOnly(artist, title, videoId, () => {
                if (artist) {
                    searchArtistTracks(artist, false);
                } else {
                    searchSongsByTitle(title);
                }
            });
        } else {
            // Si no tenemos videoId, lo buscamos
            searchYoutubeVideo(artist, title, null, () => {
                if (artist) {
                    searchArtistTracks(artist, false);
                } else {
                    searchSongsByTitle(title);
                }
            });
        }
    }

    // Función para buscar video en YouTube
    function searchYoutubeVideo(artist, title, lyrics, callback) {
        const apiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac';
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artist + ' ' + title)}&key=${apiKey}&maxResults=1`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('No se pudo obtener el video de YouTube');
                return response.json();
            })
            .then(data => {
                const videoId = data.items?.[0]?.id?.videoId || '';
                if (lyrics) {
                    displayResults(artist, title, lyrics, videoId);
                } else {
                    displayVideoOnly(artist, title, videoId);
                    if (callback) callback();
                }
            })
            .catch(error => {
                console.error('Error al buscar el video:', error);
                if (lyrics) {
                    displayResults(artist, title, lyrics);
                } else {
                    displayVideoOnly(artist, title);
                    if (callback) callback();
                }
            });
    }

    // Función para mostrar solo el video (modificada para aceptar callback)
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

        resultsDiv.innerHTML = `
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

    // Función para mostrar resultados con toda la letra visible (modificada para mostrar origen YouTube)
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

        resultsDiv.innerHTML = `
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

        // Configurar botón de copiar letra
        document.getElementById('copyLyricsBtn')?.addEventListener('click', function () {
            navigator.clipboard.writeText(lyrics).then(() => {
                showNotification('Letra copiada al portapapeles');
            }).catch(err => {
                console.error('Error al copiar: ', err);
                showNotification('Error al copiar la letra');
            });
        });

        // Configurar botones de compartir
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

        // Copiar enlace
        document.getElementById('copyLinkBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href.split('?')[0] + `?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`).then(() => {
                showNotification('Enlace copiado al portapapeles');
            });
        });

        // Compartir en WhatsApp
        document.getElementById('shareWhatsAppBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(`https://wa.me/?text=${shareText}%20${currentUrl}`, '_blank');
        });

        // Compartir en Facebook
        document.getElementById('shareFacebookBtn')?.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, '_blank');
        });

        // Compartir en Twitter
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
            resultsDiv.innerHTML = `
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
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(historyContainer);

        // Agregar evento para limpiar historial
        document.getElementById('clearHistory')?.addEventListener('click', clearHistory);
    }

    function clearHistory() {
        searchHistory.length = 0;
        localStorage.removeItem('lyricsSearchHistory');
        showSearchHistory();
        showNotification('Historial limpiado');
    }

    // Función para mostrar notificación
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
        }
    }

    function searchArtistTracks(artist, isPrimarySearch = false) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(artist)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) throw new Error('No se pudieron obtener las canciones del artista');
                return response.json();
            })
            .then(data => {
                try {
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
                } catch (e) {
                    console.error('Error al procesar canciones del artista:', e);
                    if (isPrimarySearch) showError('Error al procesar los resultados');
                }
            })
            .catch(error => {
                console.error('Error al buscar canciones del artista:', error);
                if (isPrimarySearch) showError('Error al buscar canciones del artista');
            });
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
        resultsDiv.innerHTML = tracksHTML;

        document.getElementById('backToSearch')?.addEventListener('click', () => {
            artistInput.focus();
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
        resultsDiv.appendChild(suggestionsContainer);
    }

    function searchSongsByTitle(title) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(title)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) throw new Error('No se pudieron encontrar canciones con ese título');
                return response.json();
            })
            .then(data => {
                try {
                    const content = JSON.parse(data.contents);
                    if (content.data && content.data.length > 0) {
                        displaySongResults(title, content.data);
                    } else {
                        showError(`No se encontraron canciones con el título "${title}"`);
                    }
                } catch (e) {
                    console.error('Error al procesar canciones:', e);
                    showError('Error al procesar los resultados');
                }
            })
            .catch(error => {
                console.error('Error al buscar canciones:', error);
                showError('Error al buscar canciones');
            });
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
        resultsDiv.innerHTML = songsHTML;

        document.getElementById('backToSearch')?.addEventListener('click', () => {
            titleInput.focus();
        });
    }

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

    function showLoading() {
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="loading-spinner">
                    <i class="fas fa-compact-disc fa-spin"></i>
                </div>
                <p>Buscando...</p>
            </div>
        `;
    }

    function showError(message) {
        let errorMessage = message;

        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            errorMessage = 'Servidor no disponible. Por favor, verifica tu conexión a internet o intenta nuevamente más tarde.';
        }

        resultsDiv.innerHTML = `
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

    // Función global para buscar desde la lista de canciones
    window.searchTrack = function (artist, title) {
        artistInput.value = artist;
        titleInput.value = title;
        searchLyrics();
    };

    // Función para limpiar inputs
    document.querySelectorAll('.clear-input').forEach(button => {
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
});