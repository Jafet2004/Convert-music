document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let ytPlayer;
    let ytPlayerReady = false;
    
    // Estado del reproductor
    const playerState = {
        currentTrack: null,
        currentTrackIndex: -1,
        currentPlaylist: null,
        repeatPlaylist: false,
        isPlaying: false,
        volume: 0.7,
        searchResults: [],
        favoriteSongs: [],
        playlists: [],
        searchHistory: [],
        searchCache: {}
    };

    // Elementos del DOM
    const DOM = {
        searchBtn: document.getElementById('searchBtn'),
        searchInput: document.getElementById('search'),
        playBtn: document.getElementById('playBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        progressBar: document.getElementById('progressBar'),
        currentTimeDisplay: document.getElementById('currentTime'),
        durationDisplay: document.getElementById('duration'),
        volumeControl: document.getElementById('volumeControl'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        addToPlaylistBtn: document.getElementById('addToPlaylistBtn'),
        resultsDiv: document.getElementById('results'),
        albumArt: document.getElementById('albumArt'),
        songTitle: document.getElementById('currentSongTitle'),
        songArtist: document.getElementById('currentSongArtist'),
        currentPlaylistName: document.getElementById('currentPlaylistName'),
        repeatBtn: document.getElementById('repeatBtn'),
        nowPlaying: document.querySelector('.now-playing')
    };

    // Prefijo para el localStorage
    const STORAGE_PREFIX = 'musicPlayer_';

    // LocalStorageManager
    const LocalStorageManager = {
        getFavoriteSongs() {
            return JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'favoriteSongs')) || [];
        },
        setFavoriteSongs(songs) {
            localStorage.setItem(STORAGE_PREFIX + 'favoriteSongs', JSON.stringify(songs));
        },
        getPlaylists() {
            return JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'playlists')) || [];
        },
        setPlaylists(playlists) {
            localStorage.setItem(STORAGE_PREFIX + 'playlists', JSON.stringify(playlists));
        },
        getSearchHistory() {
            return JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'searchHistory')) || [];
        },
        setSearchHistory(history) {
            localStorage.setItem(STORAGE_PREFIX + 'searchHistory', JSON.stringify(history));
        },
        clearData() {
            localStorage.removeItem(STORAGE_PREFIX + 'favoriteSongs');
            localStorage.removeItem(STORAGE_PREFIX + 'playlists');
            localStorage.removeItem(STORAGE_PREFIX + 'searchHistory');
        }
    };

    // Inicializar datos
    playerState.favoriteSongs = LocalStorageManager.getFavoriteSongs();
    playerState.playlists = LocalStorageManager.getPlaylists();
    playerState.searchHistory = LocalStorageManager.getSearchHistory();

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
                    DOM.volumeControl.value = playerState.volume;
                },
                'onStateChange': onPlayerStateChange
            }
        });
    }

    // Manejar cambios de estado del reproductor
    function onPlayerStateChange(event) {
        if (!playerState.currentTrack) return;
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                playerState.isPlaying = true;
                DOM.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                hideBufferingIndicator();
                break;
                
            case YT.PlayerState.PAUSED:
                playerState.isPlaying = false;
                DOM.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                break;
                
            case YT.PlayerState.ENDED:
                playerState.isPlaying = false;
                DOM.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                
                // Repetir playlist si está activo
                if (playerState.currentPlaylist) {
                    if (playerState.currentTrackIndex < playerState.searchResults.length - 1) {
                        playNext();
                    } else if (playerState.repeatPlaylist) {
                        playTrack(0); // Volver al inicio de la playlist
                    }
                } else {
                    playNext();
                }
                break;
                
            case YT.PlayerState.BUFFERING:
                showBufferingIndicator();
                break;
                
            case YT.PlayerState.CUED:
                // No hacer nada cuando el video está preparado
                break;
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
        loadYouTubeAPI();
        
        // Event listeners
        DOM.playBtn.addEventListener('click', togglePlay);
        DOM.prevBtn.addEventListener('click', playPrevious);
        DOM.nextBtn.addEventListener('click', playNext);
        DOM.progressBar.addEventListener('input', seek);
        DOM.volumeControl.addEventListener('input', setVolume);
        DOM.favoriteBtn.addEventListener('click', toggleFavorite);
        DOM.addToPlaylistBtn.addEventListener('click', showPlaylistModal);
        DOM.searchBtn.addEventListener('click', searchMusic);
        DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchMusic();
        });
        DOM.repeatBtn.addEventListener('click', toggleRepeat);
        
        // Delegación de eventos
        document.addEventListener('click', function(e) {
            // Manejar clicks en items de canción
            const songItem = e.target.closest('.song-item');
            if (songItem) {
                const songsList = songItem.closest('.songs-list');
                if (songsList) {
                    const items = songsList.querySelectorAll('.song-item');
                    const index = Array.from(items).indexOf(songItem);
                    if (index >= 0) playTrack(index);
                }
            }
            
            // Manejar clicks en tabs
            if (e.target.classList.contains('tab')) {
                const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                showTab(tabName);
            }
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

    // Extraer ID de video de YouTube desde URL
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Buscar música
    function searchMusic() {
        const query = DOM.searchInput.value.trim();
        if (!query) return;
        
        // Verificar si es una URL de YouTube
        const videoId = extractVideoId(query);
        if (videoId) {
            // Es una URL de YouTube, buscar información del video
            searchYouTubeVideoById(videoId);
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
        const apiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac';
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}&maxResults=10`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Error en la búsqueda');
                return response.json();
            })
            .then(data => {
                if (!data.items || data.items.length === 0) {
                    showError('No se encontraron resultados');
                    return;
                }
                
                playerState.searchResults = data.items.map(item => ({
                    id: item.id.videoId,
                    title: cleanVideoTitle(item.snippet.title),
                    artist: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.medium?.url || 'https://via.placeholder.com/300'
                }));
                
                // Guardar en caché
                playerState.searchCache[query] = [...playerState.searchResults];
                displaySearchResults();
                addToHistory(query);
            })
            .catch(error => {
                console.error('Error al buscar música:', error);
                showError('Error al buscar música. Intenta nuevamente.');
            });
    }

    // Buscar información de video por ID
    function searchYouTubeVideoById(videoId) {
        showLoading();
        const apiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac';
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener información del video');
                return response.json();
            })
            .then(data => {
                if (!data.items || data.items.length === 0) {
                    showError('No se encontró el video');
                    return;
                }
                
                const item = data.items[0];
                playerState.searchResults = [{
                    id: item.id,
                    title: cleanVideoTitle(item.snippet.title),
                    artist: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.medium?.url || 'https://via.placeholder.com/300'
                }];
                
                displaySearchResults();
                playTrack(0); // Reproducir automáticamente
            })
            .catch(error => {
                console.error('Error al obtener información del video:', error);
                showError('Error al cargar el video de YouTube');
            });
    }

    // Limpiar título del video
    function cleanVideoTitle(title) {
        if (!title) return '';
        
        const patternsToRemove = [
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
        
        patternsToRemove.forEach(pattern => {
            title = title.replace(pattern, '');
        });
        
        title = title.replace(/\s+/g, ' ').trim();
        title = title.replace(/[^\w\s()\-&]/g, '');
        return title || 'Sin título';
    }

    // Mostrar resultados de búsqueda
    function displaySearchResults() {
        if (!DOM.resultsDiv) return;
        
        let html = `
            <div class="results-header">
                <h2>Resultados de búsqueda</h2>
            </div>
            <div class="songs-list">
        `;
        
        playerState.searchResults.forEach((track, index) => {
            html += `
                <div class="song-item">
                    <div class="song-item-info">
                        <div class="song-item-title">
                            <i class="fas fa-music"></i>
                            ${track.title || 'Sin título'}
                        </div>
                        <div class="song-item-artist">${track.artist || 'Artista desconocido'}</div>
                    </div>
                    <div class="song-item-duration">3:30</div>
                </div>
            `;
        });
        
        html += `</div>`;
        DOM.resultsDiv.innerHTML = html;
        
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
        
        // Mostrar el reproductor si está oculto
        if (DOM.nowPlaying) {
            DOM.nowPlaying.style.display = 'block';
        }
        
        // Actualizar UI
        if (DOM.songTitle) DOM.songTitle.textContent = playerState.currentTrack.title || 'Sin título';
        if (DOM.songArtist) DOM.songArtist.textContent = playerState.currentTrack.artist || 'Artista desconocido';
        if (DOM.albumArt) DOM.albumArt.src = playerState.currentTrack.thumbnail || 'https://via.placeholder.com/300';
        
        if (ytPlayerReady && ytPlayer && ytPlayer.loadVideoById) {
            try {
                ytPlayer.loadVideoById(playerState.currentTrack.id);
                ytPlayer.playVideo();
                playerState.isPlaying = true;
                if (DOM.playBtn) DOM.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } catch (error) {
                console.error('Error al reproducir video:', error);
                showError('Error al reproducir la canción');
            }
        }
        
        updateFavoriteButton();
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
                if (DOM.playBtn) DOM.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else if (state === YT.PlayerState.PLAYING) {
                ytPlayer.pauseVideo();
                playerState.isPlaying = false;
                if (DOM.playBtn) DOM.playBtn.innerHTML = '<i class="fas fa-play"></i>';
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
            playTrack(0);
        }
    }

    // Actualizar la barra de progreso
    function updateProgressBar() {
        if (!ytPlayerReady || !ytPlayer || !ytPlayer.getDuration || !DOM.progressBar || !DOM.currentTimeDisplay || !DOM.durationDisplay) return;
        
        try {
            const duration = ytPlayer.getDuration();
            const currentTime = ytPlayer.getCurrentTime();
            
            if (duration && !isNaN(duration)) {
                const progress = (currentTime / duration) * 100;
                DOM.progressBar.value = progress;
                DOM.currentTimeDisplay.textContent = formatTime(currentTime);
                DOM.durationDisplay.textContent = formatTime(duration);
            }
        } catch (error) {
            console.error('Error al actualizar la barra de progreso:', error);
        }
    }

    // Formatear tiempo (segundos a MM:SS)
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
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
            showNotification('Canción agregada a favoritos');
        } else {
            playerState.favoriteSongs.splice(index, 1);
            showNotification('Canción eliminada de favoritos');
        }
        
        LocalStorageManager.setFavoriteSongs(playerState.favoriteSongs);
        updateFavoriteButton();
        showSearchHistory();
    }

    // Alternar repetición de playlist
    function toggleRepeat() {
        playerState.repeatPlaylist = !playerState.repeatPlaylist;
        if (DOM.repeatBtn) {
            if (playerState.repeatPlaylist) {
                DOM.repeatBtn.classList.add('active');
                showNotification('Repetición activada');
            } else {
                DOM.repeatBtn.classList.remove('active');
                showNotification('Repetición desactivada');
            }
        }
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
        
        const playlistModalElement = document.getElementById('playlistModal');
        if (!playlistModalElement) return;
        
        const playlistModal = new bootstrap.Modal(playlistModalElement);
        const playlistSelect = document.getElementById('playlistSelect');
        if (!playlistSelect) return;
        
        playlistSelect.innerHTML = '<option value="">Selecciona una playlist</option>';
        playerState.playlists.forEach((playlist, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = playlist.name || `Playlist ${index + 1}`;
            playlistSelect.appendChild(option);
        });
        
        const addToPlaylistConfirm = document.getElementById('addToPlaylistConfirm');
        if (addToPlaylistConfirm) {
            addToPlaylistConfirm.onclick = function() {
                const playlistIndex = playlistSelect.value;
                if (playlistIndex !== '') {
                    addToPlaylist(parseInt(playlistIndex));
                    playlistModal.hide();
                }
            };
        }
        
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        if (createPlaylistBtn) {
            createPlaylistBtn.onclick = function() {
                playlistModal.hide();
                showNewPlaylistModal();
            };
        }
        
        playlistModal.show();
    }

    // Mostrar modal de nueva playlist
    function showNewPlaylistModal() {
        const newPlaylistModalElement = document.getElementById('newPlaylistModal');
        if (!newPlaylistModalElement) return;
        
        const newPlaylistModal = new bootstrap.Modal(newPlaylistModalElement);
        const playlistNameInput = document.getElementById('newPlaylistName');
        if (playlistNameInput) {
            playlistNameInput.value = '';
        }
        
        const createPlaylistConfirm = document.getElementById('createPlaylistConfirm');
        if (createPlaylistConfirm) {
            createPlaylistConfirm.onclick = function() {
                const name = playlistNameInput?.value.trim();
                if (name) {
                    createNewPlaylist(name);
                    newPlaylistModal.hide();
                }
            };
        }
        
        newPlaylistModal.show();
    }

    // Crear nueva playlist
    function createNewPlaylist(name) {
        if (!name) return;
        
        playerState.playlists.push({ name: name, tracks: [] });
        LocalStorageManager.setPlaylists(playerState.playlists);
        showNotification(`Playlist "${name}" creada`);
    }

    // Agregar canción a playlist
    function addToPlaylist(playlistIndex) {
        if (!playerState.currentTrack || !playerState.playlists[playlistIndex]) return;
        
        const exists = playerState.playlists[playlistIndex].tracks.some(track => track.id === playerState.currentTrack.id);
        if (!exists) {
            playerState.playlists[playlistIndex].tracks.push(playerState.currentTrack);
            LocalStorageManager.setPlaylists(playerState.playlists);
            showNotification(`Canción agregada a "${playerState.playlists[playlistIndex].name || 'la playlist'}"`);
        } else {
            showNotification('Esta canción ya está en la playlist');
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
                <div class="tab active" onclick="showTab('history')">Historial</div>
                <div class="tab" onclick="showTab('favorites')">Favoritos</div>
                <div class="tab" onclick="showTab('playlists')">Playlists</div>
            </div>
            <div id="historyTab" class="tab-content">
        `;
        
        if (playerState.searchHistory.length > 0) {
            html += `
                <ul class="history-list">
                    ${playerState.searchHistory.map(item => `
                        <li onclick="searchFromHistory('${item.replace(/'/g, "\\'")}')">
                            <span class="history-item">
                                <i class="fas fa-history"></i> ${item}
                            </span>
                            <i class="fas fa-chevron-right"></i>
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
                        <li onclick="playFavorite(${index})">
                            <span class="favorite-item">
                                <i class="fas fa-heart"></i>
                                <span class="favorite-title">${song.title || 'Sin título'}</span>
                                <span class="favorite-artist">${song.artist || 'Artista desconocido'}</span>
                            </span>
                            <i class="fas fa-chevron-right"></i>
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
                        <li onclick="showPlaylistTracks(${index})">
                            <span class="playlist-item">
                                <i class="fas fa-list"></i>
                                <span class="playlist-name">${playlist.name || `Playlist ${index + 1}`}</span>
                                <span class="playlist-count">${playlist.tracks.length} canciones</span>
                            </span>
                            <i class="fas fa-chevron-right"></i>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            html += '<p>No tienes playlists creadas</p>';
        }
        
        html += `</div>`;
        DOM.resultsDiv.innerHTML = html;
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
                <button onclick="window.location.reload()" class="retry-btn">
                    <i class="fas fa-sync-alt"></i> Intentar nuevamente
                </button>
            </div>
        `;
    }

    // Mostrar notificación
    function showNotification(message) {
        if (!message) return;
        
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

    // Funciones globales
    window.playTrack = function(index) { 
        if (typeof index === 'number') playTrack(index); 
    };
    
    window.playFavorite = function(index) {
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
    };
    
    window.searchFromHistory = function(query) {
        if (DOM.searchInput && query) {
            DOM.searchInput.value = query;
            searchMusic();
        }
    };
    
    window.showTab = function(tabName) {
        if (!tabName) return;
        
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab) tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content) content.style.display = 'none';
        });
        
        const tab = document.querySelector(`.tab[onclick="showTab('${tabName}')"]`);
        if (tab) tab.classList.add('active');
        
        const content = document.getElementById(`${tabName}Tab`);
        if (content) content.style.display = 'block';
    };
    
    window.showPlaylistTracks = function(index) {
        if (typeof index === 'number' && index >= 0 && index < playerState.playlists.length && DOM.resultsDiv) {
            const playlist = playerState.playlists[index];
            playerState.currentPlaylist = playlist;
            updatePlayerUI();
            
            let html = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2>${playlist.name || `Playlist ${index + 1}`}</h2>
                    <div>
                        <button onclick="playPlaylist(${index})" class="btn btn-sm btn-primary me-2">
                            <i class="fas fa-play"></i> Reproducir todo
                        </button>
                        <button onclick="showSearchHistory()" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                </div>
                <div class="songs-list">
            `;
            
            if (playlist.tracks.length > 0) {
                playlist.tracks.forEach((track, trackIndex) => {
                    html += `
                        <div class="song-item" onclick="playFromPlaylist(${index}, ${trackIndex})">
                            <div class="song-item-info">
                                <div class="song-item-title">
                                    <i class="fas fa-music"></i>
                                    ${track.title || 'Sin título'}
                                </div>
                                <div class="song-item-artist">${track.artist || 'Artista desconocido'}</div>
                            </div>
                            <div class="song-item-duration">3:30</div>
                        </div>
                    `;
                });
            } else {
                html += '<p>Esta playlist está vacía</p>';
            }
            
            html += `</div>`;
            DOM.resultsDiv.innerHTML = html;
        }
    };
    
    window.playFromPlaylist = function(playlistIndex, trackIndex) {
        if (typeof playlistIndex === 'number' && typeof trackIndex === 'number' && 
            playlistIndex >= 0 && playlistIndex < playerState.playlists.length) {
            const playlist = playerState.playlists[playlistIndex];
            playerState.currentPlaylist = playlist;
            playerState.searchResults = [...playlist.tracks];
            playTrack(trackIndex);
            updatePlayerUI();
        }
    };
    
    window.playPlaylist = function(playlistIndex) {
        if (typeof playlistIndex === 'number' && playlistIndex >= 0 && playlistIndex < playerState.playlists.length) {
            const playlist = playerState.playlists[playlistIndex];
            playerState.currentPlaylist = playlist;
            playerState.searchResults = [...playlist.tracks];
            
            if (playlist.tracks.length > 0) {
                playTrack(0);
            }
            
            updatePlayerUI();
        }
    };

    // Inicializar el reproductor
    initPlayer();
});