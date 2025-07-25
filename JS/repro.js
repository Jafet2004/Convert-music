document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let ytPlayer;
    let ytPlayerReady = false;
    let searchTimeout;
    const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
    
    // Configuración del reproductor
    const config = {
        apiKey: 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac', // Reemplazar con tu clave de API
        maxResults: 15,
        retryAttempts: 3,
        retryDelay: 1000,
        defaultVolume: 0.7,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    };

    // Estado del reproductor
    const playerState = {
        currentTrack: null,
        currentTrackIndex: -1,
        currentPlaylist: null,
        repeatPlaylist: false,
        shufflePlaylist: false,
        isPlaying: false,
        volume: config.defaultVolume,
        playbackRate: 1,
        searchResults: [],
        favoriteSongs: [],
        playlists: [],
        queue: [],
        searchHistory: [],
        searchCache: {},
        retryCount: 0
    };

    // Elementos del DOM
    const DOM = {
        searchBtn: document.getElementById('searchBtn'),
        searchInput: document.getElementById('search'),
        playBtn: document.getElementById('playBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        shuffleBtn: document.getElementById('shuffleBtn'),
        repeatBtn: document.getElementById('repeatBtn'),
        progressBar: document.getElementById('progressBar'),
        currentTimeDisplay: document.getElementById('currentTime'),
        durationDisplay: document.getElementById('duration'),
        volumeControl: document.getElementById('volumeControl'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        addToPlaylistBtn: document.getElementById('addToPlaylistBtn'),
        addToQueueBtn: document.getElementById('addToQueueBtn'),
        resultsDiv: document.getElementById('results'),
        albumArt: document.getElementById('albumArt'),
        songTitle: document.getElementById('currentSongTitle'),
        songArtist: document.getElementById('currentSongArtist'),
        currentPlaylistName: document.getElementById('currentPlaylistName'),
        nowPlaying: document.querySelector('.now-playing')
    };

    // Prefijo para el localStorage
    const STORAGE_PREFIX = 'musicPlayer_';

    // LocalStorageManager
    const LocalStorageManager = {
        getItem(key) {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key));
            } catch (error) {
                console.error('Error al leer del localStorage:', error);
                return null;
            }
        },
        
        setItem(key, value) {
            try {
                localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error al escribir en el localStorage:', error);
                return false;
            }
        },
        
        getFavoriteSongs() {
            return this.getItem('favoriteSongs') || [];
        },
        
        setFavoriteSongs(songs) {
            return this.setItem('favoriteSongs', songs);
        },
        
        getPlaylists() {
            return this.getItem('playlists') || [];
        },
        
        setPlaylists(playlists) {
            return this.setItem('playlists', playlists);
        },
        
        getQueue() {
            return this.getItem('queue') || [];
        },
        
        setQueue(queue) {
            return this.setItem('queue', queue);
        },
        
        getSearchHistory() {
            return this.getItem('searchHistory') || [];
        },
        
        setSearchHistory(history) {
            return this.setItem('searchHistory', history);
        },
        
        getVolume() {
            const volume = this.getItem('volume');
            return volume !== null ? volume : config.defaultVolume;
        },
        
        setVolume(volume) {
            return this.setItem('volume', volume);
        },
        
        getPlaybackRate() {
            const rate = this.getItem('playbackRate');
            return rate !== null ? rate : 1;
        },
        
        setPlaybackRate(rate) {
            return this.setItem('playbackRate', rate);
        }
    };

    // Inicializar datos
    function initializePlayerState() {
        playerState.favoriteSongs = LocalStorageManager.getFavoriteSongs();
        playerState.playlists = LocalStorageManager.getPlaylists();
        playerState.searchHistory = LocalStorageManager.getSearchHistory();
        playerState.queue = LocalStorageManager.getQueue();
        playerState.volume = LocalStorageManager.getVolume();
        playerState.playbackRate = LocalStorageManager.getPlaybackRate();
        
        if (DOM.volumeControl) {
            DOM.volumeControl.value = playerState.volume;
        }
    }

    // Cargar la API de YouTube Player
    function loadYouTubeAPI() {
        if (window.YT && window.YT.Player) {
            onYouTubeIframeAPIReady();
        } else {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = function() {
                onYouTubeIframeAPIReady();
            };
        }
    }

    // Inicializar el reproductor de YouTube
    function onYouTubeIframeAPIReady() {
        ytPlayer = new YT.Player('ytPlayerIframe', {
            height: '0',
            width: '0',
            videoId: '',
            playerVars: {
                controls: 0,
                disablekb: 1,
                fs: 0,
                rel: 0,
                modestbranding: 1
            },
            events: {
                'onReady': function() { 
                    ytPlayerReady = true;
                    ytPlayer.setVolume(playerState.volume * 100);
                    ytPlayer.setPlaybackRate(playerState.playbackRate);
                    
                    if (DOM.volumeControl) {
                        DOM.volumeControl.value = playerState.volume;
                    }
                },
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    }

    // Manejar errores del reproductor
    function onPlayerError(event) {
        console.error('Error en el reproductor de YouTube:', event.data);
        
        if (playerState.retryCount < config.retryAttempts) {
            playerState.retryCount++;
            showNotification(`Error al reproducir. Reintentando (${playerState.retryCount}/${config.retryAttempts})`, 'error');
            
            setTimeout(() => {
                if (playerState.currentTrack) {
                    playTrackById(playerState.currentTrack.id);
                }
            }, config.retryDelay);
        } else {
            showError('Error al reproducir la canción. Intenta con otra.');
            playerState.retryCount = 0;
        }
    }

    // Manejar cambios de estado del reproductor
    function onPlayerStateChange(event) {
        if (!playerState.currentTrack) return;
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                playerState.isPlaying = true;
                playerState.retryCount = 0;
                if (DOM.playBtn) {
                    DOM.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    DOM.playBtn.setAttribute('aria-pressed', 'true');
                }
                hideBufferingIndicator();
                break;
                
            case YT.PlayerState.PAUSED:
                playerState.isPlaying = false;
                if (DOM.playBtn) {
                    DOM.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    DOM.playBtn.setAttribute('aria-pressed', 'false');
                }
                break;
                
            case YT.PlayerState.ENDED:
                playerState.isPlaying = false;
                if (DOM.playBtn) {
                    DOM.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    DOM.playBtn.setAttribute('aria-pressed', 'false');
                }
                
                handlePlaybackEnd();
                break;
                
            case YT.PlayerState.BUFFERING:
                showBufferingIndicator();
                break;
        }
    }

    // Manejar el final de la reproducción
    function handlePlaybackEnd() {
        if (playerState.queue.length > 0) {
            playFromQueue(0);
            return;
        }
        
        if (playerState.currentPlaylist) {
            if (playerState.currentTrackIndex < playerState.searchResults.length - 1) {
                playNext();
            } else if (playerState.repeatPlaylist) {
                if (playerState.shufflePlaylist) {
                    shufflePlaylist();
                } else {
                    playTrack(0);
                }
            }
        } else if (playerState.searchResults.length > 0 && 
                  playerState.currentTrackIndex < playerState.searchResults.length - 1) {
            playNext();
        }
    }

    // Mostrar indicador de buffering
    function showBufferingIndicator() {
        let indicator = document.getElementById('bufferingIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'bufferingIndicator';
            indicator.innerHTML = '<i class="fas fa-compact-disc fa-spin"></i>';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    // Ocultar indicador de buffering
    function hideBufferingIndicator() {
        const indicator = document.getElementById('bufferingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Inicializar el reproductor
    function initPlayer() {
        initializePlayerState();
        loadYouTubeAPI();
        
        // Event listeners
        DOM.playBtn?.addEventListener('click', togglePlay);
        DOM.prevBtn?.addEventListener('click', playPrevious);
        DOM.nextBtn?.addEventListener('click', playNext);
        DOM.shuffleBtn?.addEventListener('click', toggleShuffle);
        DOM.repeatBtn?.addEventListener('click', toggleRepeat);
        DOM.progressBar?.addEventListener('input', seek);
        DOM.volumeControl?.addEventListener('input', setVolume);
        DOM.favoriteBtn?.addEventListener('click', toggleFavorite);
        DOM.addToPlaylistBtn?.addEventListener('click', showPlaylistModal);
        DOM.addToQueueBtn?.addEventListener('click', addCurrentToQueue);
        
        // Evento de búsqueda con debounce
        DOM.searchBtn?.addEventListener('click', searchMusic);
        DOM.searchInput?.addEventListener('input', handleSearchInput);
        DOM.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchMusic();
        });
        
        // Limpiar input
        document.querySelectorAll('.clear-input').forEach(clearBtn => {
            const targetId = clearBtn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                clearBtn.addEventListener('click', () => {
                    input.value = '';
                    input.focus();
                });
            }
        });
        
        showSearchHistory();
        setInterval(updateProgressBar, 500);
    }

    // Manejar entrada de búsqueda con debounce
    function handleSearchInput() {
        clearTimeout(searchTimeout);
        
        if (DOM.searchInput.value.trim().length > 2) {
            searchTimeout = setTimeout(() => {
                searchMusic();
            }, 800);
        }
    }

    // Extraer ID de video de YouTube desde URL
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Buscar música
    async function searchMusic() {
        const query = DOM.searchInput?.value.trim();
        if (!query) return;
        
        // Verificar si es una URL de YouTube
        const videoId = extractVideoId(query);
        if (videoId) {
            await searchYouTubeVideoById(videoId);
            return;
        }
        
        // Verificar caché
        if (playerState.searchCache[query]) {
            playerState.searchResults = [...playerState.searchCache[query]];
            displaySearchResults();
            addToHistory(query);
            return;
        }
        
        showLoading();
        
        try {
            const response = await fetch(`${API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${config.apiKey}&maxResults=${config.maxResults}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                showError('No se encontraron resultados');
                return;
            }
            
            // Obtener detalles de los videos para duraciones exactas
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const detailsResponse = await fetch(`${API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds}&key=${config.apiKey}`);
            
            if (!detailsResponse.ok) {
                throw new Error(`HTTP error! status: ${detailsResponse.status}`);
            }
            
            const details = await detailsResponse.json();
            
            playerState.searchResults = data.items.map(item => {
                const detail = details.items.find(d => d.id === item.id.videoId) || {};
                return {
                    id: item.id.videoId,
                    title: cleanVideoTitle(item.snippet.title),
                    artist: item.snippet.channelTitle,
                    thumbnail: getBestThumbnail(item.snippet.thumbnails),
                    duration: parseDuration(detail.contentDetails?.duration)
                };
            });
            
            // Guardar en caché
            playerState.searchCache[query] = [...playerState.searchResults];
            displaySearchResults();
            addToHistory(query);
        } catch (error) {
            console.error('Error al buscar música:', error);
            showError(getErrorMessage(error));
        }
    }

    // Obtener el mensaje de error adecuado
    function getErrorMessage(error) {
        if (error.message.includes('quota')) {
            return 'Límite de búsquedas alcanzado. Intenta más tarde.';
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return 'Problema de conexión. Verifica tu internet.';
        }
        return 'Error al buscar música. Intenta nuevamente.';
    }

    // Obtener la mejor miniatura disponible
    function getBestThumbnail(thumbnails) {
        return thumbnails?.maxres?.url || 
               thumbnails?.standard?.url || 
               thumbnails?.high?.url || 
               thumbnails?.medium?.url || 
               thumbnails?.default?.url || 
               'https://via.placeholder.com/300';
    }

    // Parsear duración ISO 8601 a segundos
    function parseDuration(duration) {
        if (!duration) return 0;
        
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return 0;
        
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        
        return hours * 3600 + minutes * 60 + seconds;
    }

    // Buscar información de video por ID
    async function searchYouTubeVideoById(videoId) {
        showLoading();
        
        try {
            const response = await fetch(`${API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${config.apiKey}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                showError('No se encontró el video');
                return;
            }
            
            const item = data.items[0];
            playerState.searchResults = [{
                id: item.id,
                title: cleanVideoTitle(item.snippet.title),
                artist: item.snippet.channelTitle,
                thumbnail: getBestThumbnail(item.snippet.thumbnails),
                duration: parseDuration(item.contentDetails?.duration)
            }];
            
            displaySearchResults();
            playTrack(0); // Reproducir automáticamente
        } catch (error) {
            console.error('Error al obtener información del video:', error);
            showError(getErrorMessage(error));
        }
    }

    // Limpiar título del video
    function cleanVideoTitle(title) {
        if (!title) return 'Sin título';
        
        const patternsToRemove = [
            /\(official\s*(video|music\s*video|audio|lyrics?)\)/i,
            /\[official\s*(video|music\s*video|audio|lyrics?)\]/i,
            /official\s*(video|music\s*video|audio|lyrics?)/i,
            /\(lyrics?\)/i,
            /\[lyrics?\]/i,
            /lyrics?/i,
            /\([0-9]{4}\)/,
            /ft\.? .*$/i,
            /feat\.? .*$/i,
            /with .*$/i,
            /vs\.? .*$/i
        ];
        
        let cleanedTitle = title;
        patternsToRemove.forEach(pattern => {
            cleanedTitle = cleanedTitle.replace(pattern, '');
        });
        
        // Limpiar caracteres especiales y espacios múltiples
        cleanedTitle = cleanedTitle
            .replace(/[^\w\s()\-&]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        return cleanedTitle || 'Sin título';
    }

    // Mostrar resultados de búsqueda
    function displaySearchResults() {
        if (!DOM.resultsDiv) return;
        
        let html = `
            <div class="results-header">
                <h2>Resultados de búsqueda</h2>
                <div class="result-count">${playerState.searchResults.length} resultados</div>
            </div>
            <div class="songs-list">
        `;
        
        playerState.searchResults.forEach((track, index) => {
            html += `
                <div class="song-item" data-id="${track.id}" role="button" aria-label="Reproducir ${track.title}">
                    <div class="song-item-info">
                        <div class="song-item-title">
                            <i class="fas fa-music"></i>
                            ${track.title}
                        </div>
                        <div class="song-item-artist">${track.artist || 'Artista desconocido'}</div>
                    </div>
                    <div class="song-item-duration">${formatTime(track.duration)}</div>
                </div>
            `;
        });
        
        html += `</div>`;
        DOM.resultsDiv.innerHTML = html;
        
        // Agregar event listeners a los items de canción
        document.querySelectorAll('.song-item').forEach((item, index) => {
            item.addEventListener('click', () => playTrack(index));
        });
        
        // Limpiar playlist actual si estamos mostrando resultados de búsqueda
        if (playerState.currentPlaylist) {
            playerState.currentPlaylist = null;
            updatePlayerUI();
        }
    }

    // Reproducir una canción específica
    function playTrack(index) {
        if (index < 0 || index >= playerState.searchResults.length) return;
        
        playerState.currentTrackIndex = index;
        playerState.currentTrack = playerState.searchResults[index];
        
        // Mostrar el reproductor
        if (DOM.nowPlaying) {
            DOM.nowPlaying.style.display = 'block';
        }
        
        // Actualizar UI
        if (DOM.songTitle) DOM.songTitle.textContent = playerState.currentTrack.title;
        if (DOM.songArtist) DOM.songArtist.textContent = playerState.currentTrack.artist || 'Artista desconocido';
        if (DOM.albumArt) {
            DOM.albumArt.src = playerState.currentTrack.thumbnail;
            DOM.albumArt.onerror = () => {
                DOM.albumArt.src = 'https://via.placeholder.com/300';
            };
        }
        
        // Actualizar duración
        if (DOM.durationDisplay) {
            DOM.durationDisplay.textContent = formatTime(playerState.currentTrack.duration);
        }
        
        playTrackById(playerState.currentTrack.id);
        updateFavoriteButton();
    }

    // Reproducir por ID de video
    function playTrackById(videoId) {
        if (ytPlayerReady && ytPlayer && ytPlayer.loadVideoById) {
            try {
                ytPlayer.loadVideoById(videoId);
                ytPlayer.playVideo();
                playerState.isPlaying = true;
                if (DOM.playBtn) {
                    DOM.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    DOM.playBtn.setAttribute('aria-pressed', 'true');
                }
            } catch (error) {
                console.error('Error al reproducir video:', error);
                showError('Error al reproducir la canción');
            }
        }
    }

    // Alternar reproducción/pausa
    function togglePlay() {
        if (!ytPlayerReady || !ytPlayer) return;
        
        if (!playerState.currentTrack && playerState.searchResults.length > 0) {
            playTrack(0);
            return;
        }
        
        try {
            const state = ytPlayer.getPlayerState();
            if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED || state === YT.PlayerState.CUED) {
                ytPlayer.playVideo();
                playerState.isPlaying = true;
                if (DOM.playBtn) {
                    DOM.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    DOM.playBtn.setAttribute('aria-pressed', 'true');
                }
            } else if (state === YT.PlayerState.PLAYING) {
                ytPlayer.pauseVideo();
                playerState.isPlaying = false;
                if (DOM.playBtn) {
                    DOM.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    DOM.playBtn.setAttribute('aria-pressed', 'false');
                }
            }
        } catch (error) {
            console.error('Error al alternar reproducción:', error);
        }
    }

    // Reproducir la canción anterior
    function playPrevious() {
        if (playerState.currentTrackIndex > 0) {
            playTrack(playerState.currentTrackIndex - 1);
        } else if (playerState.currentPlaylist && playerState.repeatPlaylist) {
            // Si está en modo repetición, ir al final de la playlist
            playTrack(playerState.searchResults.length - 1);
        }
    }

    // Reproducir la siguiente canción
    function playNext() {
        if (playerState.currentTrackIndex < playerState.searchResults.length - 1) {
            playTrack(playerState.currentTrackIndex + 1);
        } else if (playerState.currentPlaylist && playerState.repeatPlaylist) {
            // Si está en modo repetición, volver al inicio
            if (playerState.shufflePlaylist) {
                shufflePlaylist();
            } else {
                playTrack(0);
            }
        }
    }

    // Mezclar playlist
    function shufflePlaylist() {
        if (!playerState.currentPlaylist) return;
        
        // Copiar array sin el elemento actual
        const shuffled = [...playerState.searchResults];
        const currentItem = shuffled.splice(playerState.currentTrackIndex, 1)[0];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Reinsertar el elemento actual al principio
        shuffled.unshift(currentItem);
        playerState.searchResults = shuffled;
        playerState.currentTrackIndex = 0;
        
        // Actualizar UI
        displaySearchResults();
        showNotification('Playlist mezclada', 'success');
    }

    // Alternar mezcla
    function toggleShuffle() {
        playerState.shufflePlaylist = !playerState.shufflePlaylist;
        if (DOM.shuffleBtn) {
            if (playerState.shufflePlaylist) {
                DOM.shuffleBtn.classList.add('active');
                showNotification('Modo mezcla activado', 'success');
            } else {
                DOM.shuffleBtn.classList.remove('active');
                showNotification('Modo mezcla desactivado', 'info');
            }
        }
    }

    // Alternar repetición
    function toggleRepeat() {
        playerState.repeatPlaylist = !playerState.repeatPlaylist;
        if (DOM.repeatBtn) {
            if (playerState.repeatPlaylist) {
                DOM.repeatBtn.classList.add('active');
                showNotification('Repetición activada', 'success');
            } else {
                DOM.repeatBtn.classList.remove('active');
                showNotification('Repetición desactivada', 'info');
            }
        }
    }

    // Actualizar la barra de progreso
    function updateProgressBar() {
        if (!ytPlayerReady || !ytPlayer || !ytPlayer.getDuration || !DOM.progressBar || !DOM.currentTimeDisplay) return;
        
        try {
            const duration = ytPlayer.getDuration();
            const currentTime = ytPlayer.getCurrentTime();
            
            if (duration && !isNaN(duration)) {
                const progress = (currentTime / duration) * 100;
                DOM.progressBar.value = progress;
                DOM.currentTimeDisplay.textContent = formatTime(currentTime);
            }
        } catch (error) {
            console.error('Error al actualizar la barra de progreso:', error);
        }
    }

    // Formatear tiempo (segundos a MM:SS)
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Buscar en la canción
    function seek() {
        if (!ytPlayerReady || !ytPlayer || !DOM.progressBar) return;
        
        try {
            const duration = ytPlayer.getDuration();
            if (duration && !isNaN(duration)) {
                const seekTime = (DOM.progressBar.value / 100) * duration;
                ytPlayer.seekTo(seekTime, true);
            }
        } catch (error) {
            console.error('Error al buscar en la canción:', error);
        }
    }

    // Establecer volumen
    function setVolume() {
        if (!ytPlayerReady || !ytPlayer || !DOM.volumeControl) return;
        
        try {
            playerState.volume = DOM.volumeControl.value;
            ytPlayer.setVolume(playerState.volume * 100);
            LocalStorageManager.setVolume(playerState.volume);
        } catch (error) {
            console.error('Error al establecer volumen:', error);
        }
    }

    // Alternar favorito
    function toggleFavorite() {
        if (!playerState.currentTrack) return;
        
        const index = playerState.favoriteSongs.findIndex(song => song.id === playerState.currentTrack.id);
        if (index === -1) {
            playerState.favoriteSongs.push(playerState.currentTrack);
            showNotification('Canción agregada a favoritos', 'success');
        } else {
            playerState.favoriteSongs.splice(index, 1);
            showNotification('Canción eliminada de favoritos', 'info');
        }
        
        LocalStorageManager.setFavoriteSongs(playerState.favoriteSongs);
        updateFavoriteButton();
        showSearchHistory();
    }

    // Actualizar el botón de favoritos
    function updateFavoriteButton() {
        if (!playerState.currentTrack || !DOM.favoriteBtn) return;
        
        const isFavorite = playerState.favoriteSongs.some(song => song.id === playerState.currentTrack.id);
        if (isFavorite) {
            DOM.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorito';
            DOM.favoriteBtn.classList.add('is-favorite');
        } else {
            DOM.favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favorito';
            DOM.favoriteBtn.classList.remove('is-favorite');
        }
    }

    // Actualizar la UI del reproductor
    function updatePlayerUI() {
        if (!DOM.currentPlaylistName) return;
        
        if (playerState.currentPlaylist) {
            DOM.currentPlaylistName.textContent = `Playlist: ${playerState.currentPlaylist.name || 'Sin nombre'}`;
            DOM.currentPlaylistName.style.display = 'block';
        } else {
            DOM.currentPlaylistName.style.display = 'none';
        }
    }

    // Mostrar modal de playlists
    function showPlaylistModal() {
        if (!playerState.currentTrack) return;
        
        const playlistModal = new bootstrap.Modal(document.getElementById('playlistModal'));
        const playlistSelect = document.getElementById('playlistSelect');
        if (!playlistSelect) return;
        
        playlistSelect.innerHTML = '<option value="">Selecciona una playlist</option>';
        playerState.playlists.forEach((playlist, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = playlist.name || `Playlist ${index + 1}`;
            playlistSelect.appendChild(option);
        });
        
        document.getElementById('addToPlaylistConfirm').onclick = function() {
            const playlistIndex = playlistSelect.value;
            if (playlistIndex !== '') {
                addToPlaylist(parseInt(playlistIndex));
                playlistModal.hide();
            }
        };
        
        document.getElementById('createPlaylistBtn').onclick = function() {
            playlistModal.hide();
            showNewPlaylistModal();
        };
        
        playlistModal.show();
    }

    // Mostrar modal de nueva playlist
    function showNewPlaylistModal() {
        const newPlaylistModal = new bootstrap.Modal(document.getElementById('newPlaylistModal'));
        const playlistNameInput = document.getElementById('newPlaylistName');
        if (playlistNameInput) {
            playlistNameInput.value = '';
        }
        
        document.getElementById('createPlaylistConfirm').onclick = function() {
            const name = playlistNameInput?.value.trim();
            if (name) {
                createNewPlaylist(name);
                newPlaylistModal.hide();
            }
        };
        
        newPlaylistModal.show();
    }

    // Crear nueva playlist
    function createNewPlaylist(name) {
        if (!name) return;
        
        playerState.playlists.push({ name: name, tracks: [] });
        LocalStorageManager.setPlaylists(playerState.playlists);
        showNotification(`Playlist "${name}" creada`, 'success');
    }

    // Agregar canción a playlist
    function addToPlaylist(playlistIndex) {
        if (!playerState.currentTrack || !playerState.playlists[playlistIndex]) return;
        
        const exists = playerState.playlists[playlistIndex].tracks.some(track => track.id === playerState.currentTrack.id);
        if (!exists) {
            playerState.playlists[playlistIndex].tracks.push(playerState.currentTrack);
            LocalStorageManager.setPlaylists(playerState.playlists);
            showNotification(`Canción agregada a "${playerState.playlists[playlistIndex].name || 'la playlist'}"`, 'success');
        } else {
            showNotification('Esta canción ya está en la playlist', 'info');
        }
    }

    // Funcionalidad de cola de reproducción
    function addCurrentToQueue() {
        if (!playerState.currentTrack) return;
        
        playerState.queue.push(playerState.currentTrack);
        LocalStorageManager.setQueue(playerState.queue);
        showNotification('Canción agregada a la cola', 'success');
    }

    // Reproducir desde la cola
    function playFromQueue(index) {
        if (index < 0 || index >= playerState.queue.length) return;
        
        const track = playerState.queue[index];
        playerState.queue.splice(index, 1);
        LocalStorageManager.setQueue(playerState.queue);
        
        // Buscar el track en los resultados actuales
        const existingIndex = playerState.searchResults.findIndex(t => t.id === track.id);
        if (existingIndex >= 0) {
            playTrack(existingIndex);
        } else {
            // Si no está en los resultados, agregarlo y reproducir
            playerState.searchResults.unshift(track);
            playTrack(0);
        }
    }

    // Mostrar historial de búsqueda y favoritos
    function showSearchHistory() {
        if (!DOM.resultsDiv) return;
        
        if (playerState.searchHistory.length === 0 && playerState.favoriteSongs.length === 0 && playerState.playlists.length === 0) {
            DOM.resultsDiv.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <i class="fas fa-search"></i>
                        <h3>Busca tu música favorita</h3>
                        <p>Comienza escribiendo el nombre de una canción o artista, o pega una URL de YouTube</p>
                    </div>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="tabs">
                <div class="tab active" data-tab="history">Historial</div>
                <div class="tab" data-tab="favorites">Favoritos</div>
                <div class="tab" data-tab="playlists">Playlists</div>
            </div>
            <div id="historyTab" class="tab-content">
        `;
        
        if (playerState.searchHistory.length > 0) {
            html += `
                <ul class="history-list">
                    ${playerState.searchHistory.map((item, index) => `
                        <li class="history-item" data-index="${index}">
                            <span onclick="window.playerAPI.searchFromHistory('${item.replace(/'/g, "\\'")}')">
                                <i class="fas fa-history"></i> ${item}
                            </span>
                            <button class="btn btn-sm btn-outline-secondary remove-history-item" 
                                    aria-label="Eliminar del historial">
                                <i class="fas fa-times"></i>
                            </button>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            html += '<p>No hay historial de búsqueda</p>';
        }
        
        html += `</div>
            <div id="favoritesTab" class="tab-content" style="display:none;">
        `;
        
        if (playerState.favoriteSongs.length > 0) {
            html += `
                <ul class="favorites-list">
                    ${playerState.favoriteSongs.map((song, index) => `
                        <li onclick="window.playerAPI.playFavorite(${index})">
                            <span class="favorite-item">
                                <i class="fas fa-heart"></i>
                                <span class="favorite-title">${song.title || 'Sin título'}</span>
                                <span class="favorite-artist">${song.artist || 'Artista desconocido'}</span>
                            </span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            html += '<p>No tienes canciones favoritas aún</p>';
        }
        
        html += `</div>
            <div id="playlistsTab" class="tab-content" style="display:none;">
        `;
        
        if (playerState.playlists.length > 0) {
            html += `
                <ul class="playlists-list">
                    ${playerState.playlists.map((playlist, index) => `
                        <li onclick="window.playerAPI.showPlaylistTracks(${index})">
                            <span class="playlist-item">
                                <i class="fas fa-list"></i>
                                <span class="playlist-name">${playlist.name || `Playlist ${index + 1}`}</span>
                                <span class="playlist-count">${playlist.tracks.length} canciones</span>
                            </span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            html += '<p>No tienes playlists creadas</p>';
        }
        
        html += `</div>`;
        DOM.resultsDiv.innerHTML = html;
        
        // Agregar event listeners para las pestañas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                showTab(tabName);
            });
        });
        
        // Agregar event listeners para eliminar del historial
        document.querySelectorAll('.remove-history-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.history-item');
                if (item) {
                    const index = parseInt(item.getAttribute('data-index'));
                    removeFromHistory(index);
                }
            });
        });
    }

    // Mostrar pestaña específica
    function showTab(tabName) {
        if (!tabName) return;
        
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === `${tabName}Tab` ? 'block' : 'none';
        });
    }

    // Eliminar elemento del historial
    function removeFromHistory(index) {
        if (index >= 0 && index < playerState.searchHistory.length) {
            playerState.searchHistory.splice(index, 1);
            LocalStorageManager.setSearchHistory(playerState.searchHistory);
            showSearchHistory();
            showNotification('Elemento eliminado del historial', 'info');
        }
    }

    // Agregar a historial de búsqueda
    function addToHistory(query) {
        if (!query) return;
        
        const exists = playerState.searchHistory.some(item => item.toLowerCase() === query.toLowerCase());
        if (!exists) {
            playerState.searchHistory.unshift(query);
            if (playerState.searchHistory.length > 10) playerState.searchHistory.pop();
            LocalStorageManager.setSearchHistory(playerState.searchHistory);
        }
    }

    // Mostrar loading
    function showLoading() {
        if (!DOM.resultsDiv) return;
        
        DOM.resultsDiv.innerHTML = `
            <div class="loading">
                <div class="loading-spinner">
                    <i class="fas fa-compact-disc fa-spin"></i>
                </div>
                <p>Buscando...</p>
            </div>
        `;
    }

    // Mostrar error
    function showError(message) {
        if (!DOM.resultsDiv) return;
        
        DOM.resultsDiv.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p>${message}</p>
                <button class="retry-btn">
                    <i class="fas fa-sync-alt"></i> Intentar nuevamente
                </button>
            </div>
        `;
        
        // Agregar event listener al botón de reintento
        document.querySelector('.retry-btn')?.addEventListener('click', () => {
            searchMusic();
        });
    }

    // Mostrar notificación
    function showNotification(message, type = 'info') {
        if (!message) return;
        
        const colors = {
            info: '#4a6fa5',
            success: '#4ad66d',
            warning: '#f8961e',
            error: '#f72585'
        };
        
        const icon = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-circle',
            error: 'fa-times-circle'
        }[type];
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
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

    // API pública para acceso desde HTML
    window.playerAPI = {
        searchFromHistory: function(query) {
            if (DOM.searchInput && query) {
                DOM.searchInput.value = query;
                searchMusic();
            }
        },
        
        playFavorite: function(index) {
            if (typeof index === 'number' && index >= 0 && index < playerState.favoriteSongs.length) {
                const track = playerState.favoriteSongs[index];
                const existingIndex = playerState.searchResults.findIndex(t => t.id === track.id);
                
                if (existingIndex >= 0) {
                    playTrack(existingIndex);
                } else {
                    if (DOM.searchInput) DOM.searchInput.value = `${track.artist || ''} - ${track.title || ''}`.trim();
                    searchMusic();
                    setTimeout(() => {
                        const newIndex = playerState.searchResults.findIndex(t => t.id === track.id);
                        if (newIndex >= 0) {
                            playTrack(newIndex);
                        }
                    }, 1000);
                }
            }
        },
        
        showPlaylistTracks: function(index) {
            if (typeof index === 'number' && index >= 0 && index < playerState.playlists.length && DOM.resultsDiv) {
                const playlist = playerState.playlists[index];
                playerState.currentPlaylist = playlist;
                playerState.searchResults = [...playlist.tracks];
                updatePlayerUI();
                
                let html = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2>${playlist.name || `Playlist ${index + 1}`}</h2>
                        <div>
                            <button class="btn btn-sm btn-primary me-2" id="playPlaylistBtn">
                                <i class="fas fa-play"></i> Reproducir todo
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" id="backToHistoryBtn">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                    </div>
                    <div class="songs-list">
                `;
                
                if (playlist.tracks.length > 0) {
                    playlist.tracks.forEach((track, trackIndex) => {
                        html += `
                            <div class="song-item" data-id="${track.id}">
                                <div class="song-item-info">
                                    <div class="song-item-title">
                                        <i class="fas fa-music"></i>
                                        ${track.title || 'Sin título'}
                                    </div>
                                    <div class="song-item-artist">${track.artist || 'Artista desconocido'}</div>
                                </div>
                                <div class="song-item-duration">${formatTime(track.duration)}</div>
                            </div>
                        `;
                    });
                } else {
                    html += '<p>Esta playlist está vacía</p>';
                }
                
                html += `</div>`;
                DOM.resultsDiv.innerHTML = html;
                
                // Agregar event listeners a los items de canción
                document.querySelectorAll('.song-item').forEach((item, trackIndex) => {
                    item.addEventListener('click', () => {
                        playTrack(trackIndex);
                    });
                });
                
                // Agregar event listeners a los botones
                document.getElementById('playPlaylistBtn')?.addEventListener('click', () => {
                    if (playerState.shufflePlaylist) {
                        shufflePlaylist();
                    } else {
                        playTrack(0);
                    }
                });
                
                document.getElementById('backToHistoryBtn')?.addEventListener('click', showSearchHistory);
            }
        }
    };

    // Inicializar el reproductor
    initPlayer();
});