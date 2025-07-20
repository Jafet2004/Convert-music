// Variables globales
        let currentSongIndex = -1;
        let isPlaying = false;
        let isShuffled = false;
        let isRepeating = false;
        let currentPlaylist = [];
        let audioElement = document.getElementById('audioPlayer');
        let searchHistory = JSON.parse(localStorage.getItem('musicSearchHistory')) || [];
        let favorites = JSON.parse(localStorage.getItem('favoriteSongs')) || [];
        let youtubeApiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac'; // Reemplaza con tu propia API key

        // Inicializar la aplicación
        function init() {
            setupEventListeners();
            loadSearchHistory();
            checkDarkMode();
        }

        // Configurar event listeners
        function setupEventListeners() {
            // Búsqueda
            document.getElementById('searchBtn').addEventListener('click', searchMusic);
            document.getElementById('searchInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchMusic();
            });

            // Controles del reproductor
            document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
            document.getElementById('prevBtn').addEventListener('click', playPreviousSong);
            document.getElementById('nextBtn').addEventListener('click', playNextSong);
            document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
            document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);
            document.getElementById('showLyricsBtn').addEventListener('click', showLyrics);
            document.getElementById('closeLyricsBtn').addEventListener('click', hideLyrics);

            // Barra de progreso
            document.getElementById('progressBar').addEventListener('click', (e) => {
                const progressBar = document.getElementById('progressBar');
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioElement.currentTime = pos * audioElement.duration;
            });

            // Barra de volumen
            document.getElementById('volumeBar').addEventListener('click', (e) => {
                const volumeBar = document.getElementById('volumeBar');
                const rect = volumeBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioElement.volume = pos;
                document.getElementById('volumeProgress').style.width = `${pos * 100}%`;
                updateVolumeIcon(pos);
            });

            // Icono de volumen
            document.getElementById('volumeIcon').addEventListener('click', toggleMute);

            // Eventos del audio
            audioElement.addEventListener('timeupdate', updateProgress);
            audioElement.addEventListener('ended', handleSongEnd);
            audioElement.addEventListener('loadedmetadata', updateDuration);

            // Modo oscuro
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

            // Favoritos
            document.getElementById('favorites-item').addEventListener('click', showFavorites);
        }

        // Buscar música en YouTube
        async function searchMusic() {
            const query = document.getElementById('searchInput').value.trim();
            if (!query) return;

            showLoading(true);
            currentPlaylist = [];
            document.getElementById('resultsContainer').innerHTML = '';

            try {
                // Buscar en YouTube
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${youtubeApiKey}`);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    currentPlaylist = data.items.map(item => ({
                        id: item.id.videoId,
                        title: cleanVideoTitle(item.snippet.title),
                        artist: item.snippet.channelTitle,
                        image: item.snippet.thumbnails.medium.url,
                        duration: '--:--'
                    }));

                    renderSongList(currentPlaylist);
                    addToSearchHistory(query);
                } else {
                    showNotification('No se encontraron resultados');
                }
            } catch (error) {
                console.error('Error al buscar música:', error);
                showNotification('Error al buscar música');
            } finally {
                showLoading(false);
            }
        }

        // Limpiar título de video de YouTube
        function cleanVideoTitle(title) {
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

            return title.replace(/\s+/g, ' ').trim();
        }

        // Renderizar lista de canciones
        function renderSongList(songs) {
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';

            songs.forEach((song, index) => {
                const songCard = document.createElement('div');
                songCard.className = 'song-card';
                songCard.innerHTML = `
                    <div class="song-image">
                        ${song.image ? `<img src="${song.image}" alt="${song.title}">` : '<i class="fas fa-music"></i>'}
                        <div class="play-icon">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                `;

                songCard.addEventListener('click', () => {
                    playSong(index);
                });

                resultsContainer.appendChild(songCard);
            });
        }

        // Reproducir una canción
        function playSong(index) {
            if (index < 0 || index >= currentPlaylist.length) return;

            currentSongIndex = index;
            const song = currentPlaylist[index];

            // Mostrar el reproductor si está oculto
            document.getElementById('playerContainer').style.display = 'flex';

            // Actualizar la interfaz
            document.getElementById('playerSongTitle').textContent = song.title;
            document.getElementById('playerSongArtist').textContent = song.artist;
            
            const playerImage = document.getElementById('playerSongImage');
            playerImage.innerHTML = song.image ? 
                `<img src="${song.image}" alt="${song.title}">` : 
                '<i class="fas fa-music"></i>';

            // Configurar y reproducir el audio
            audioElement.src = `https://www.youtube.com/watch?v=${song.id}`;
            audioElement.play()
                .then(() => {
                    isPlaying = true;
                    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
                    
                    // Buscar letras
                    searchLyrics(song.artist, song.title);
                })
                .catch(e => {
                    console.error('Error al reproducir:', e);
                    showNotification('Error al reproducir la canción');
                });
        }

        // Buscar letras de la canción
        async function searchLyrics(artist, title) {
            const lyricsContent = document.getElementById('lyricsContent');
            lyricsContent.textContent = 'Buscando letra...';

            try {
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
                
                const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
                const data = await response.json();

                if (data.contents) {
                    const content = JSON.parse(data.contents);
                    if (content.lyrics) {
                        lyricsContent.textContent = content.lyrics;
                    } else {
                        lyricsContent.textContent = 'No se encontró la letra para esta canción.';
                    }
                } else {
                    lyricsContent.textContent = 'No se encontró la letra para esta canción.';
                }
            } catch (error) {
                console.error('Error al buscar letras:', error);
                lyricsContent.textContent = 'Error al cargar la letra.';
            }
        }

        // Mostrar/ocultar letras
        function showLyrics() {
            document.getElementById('lyricsContainer').style.display = 'block';
        }

        function hideLyrics() {
            document.getElementById('lyricsContainer').style.display = 'none';
        }

        // Pausar la canción
        function pauseSong() {
            audioElement.pause();
            isPlaying = false;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        }

        // Alternar play/pause
        function togglePlayPause() {
            if (currentSongIndex === -1 && currentPlaylist.length > 0) {
                playSong(0);
            } else if (isPlaying) {
                pauseSong();
            } else {
                audioElement.play()
                    .then(() => {
                        isPlaying = true;
                        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
                    })
                    .catch(e => {
                        console.error('Error al reanudar:', e);
                    });
            }
        }

        // Reproducir la siguiente canción
        function playNextSong() {
            if (currentPlaylist.length === 0) return;

            let nextIndex = currentSongIndex + 1;
            if (nextIndex >= currentPlaylist.length) {
                if (isRepeating) {
                    nextIndex = 0;
                } else {
                    return;
                }
            }
            playSong(nextIndex);
        }

        // Reproducir la canción anterior
        function playPreviousSong() {
            if (currentPlaylist.length === 0) return;

            let prevIndex = currentSongIndex - 1;
            if (prevIndex < 0) {
                if (isRepeating) {
                    prevIndex = currentPlaylist.length - 1;
                } else {
                    return;
                }
            }
            playSong(prevIndex);
        }

        // Manejar el final de la canción
        function handleSongEnd() {
            if (isRepeating) {
                playSong(currentSongIndex);
            } else {
                playNextSong();
            }
        }

        // Alternar shuffle
        function toggleShuffle() {
            isShuffled = !isShuffled;
            const shuffleBtn = document.getElementById('shuffleBtn');
            
            if (isShuffled) {
                shuffleBtn.style.color = 'var(--primary-color)';
                shufflePlaylist();
            } else {
                shuffleBtn.style.color = 'var(--text-primary)';
                // Restaurar orden original (necesitaríamos guardar el orden original)
            }
        }

        // Mezclar la lista de reproducción
        function shufflePlaylist() {
            const shuffled = [...currentPlaylist];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            currentPlaylist = shuffled;
            renderSongList(currentPlaylist);
        }

        // Alternar repeat
        function toggleRepeat() {
            isRepeating = !isRepeating;
            const repeatBtn = document.getElementById('repeatBtn');
            
            if (isRepeating) {
                repeatBtn.style.color = 'var(--primary-color)';
            } else {
                repeatBtn.style.color = 'var(--text-primary)';
            }
        }

        // Actualizar la barra de progreso
        function updateProgress() {
            const currentTime = audioElement.currentTime;
            const duration = audioElement.duration || 1;
            const progressPercent = (currentTime / duration) * 100;
            document.getElementById('progress').style.width = `${progressPercent}%`;

            // Actualizar el tiempo actual
            document.getElementById('currentTime').textContent = formatTime(currentTime);
        }

        // Actualizar la duración cuando se cargan los metadatos
        function updateDuration() {
            document.getElementById('duration').textContent = formatTime(audioElement.duration);
        }

        // Formatear tiempo (segundos a MM:SS)
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        // Alternar mute
        function toggleMute() {
            if (audioElement.volume > 0) {
                audioElement.volume = 0;
                document.getElementById('volumeProgress').style.width = '0%';
                document.getElementById('volumeIcon').className = 'fas fa-volume-mute volume-icon';
            } else {
                audioElement.volume = 0.8;
                document.getElementById('volumeProgress').style.width = '80%';
                document.getElementById('volumeIcon').className = 'fas fa-volume-up volume-icon';
            }
        }

        // Actualizar icono de volumen según el nivel
        function updateVolumeIcon(volume) {
            const volumeIcon = document.getElementById('volumeIcon');
            if (volume === 0) {
                volumeIcon.className = 'fas fa-volume-mute volume-icon';
            } else if (volume < 0.5) {
                volumeIcon.className = 'fas fa-volume-down volume-icon';
            } else {
                volumeIcon.className = 'fas fa-volume-up volume-icon';
            }
        }

        // Mostrar/ocultar loading
        function showLoading(show) {
            document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
        }

        // Mostrar notificación
        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Alternar modo oscuro
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
            
            const icon = document.getElementById('darkModeIcon');
            const text = document.getElementById('darkModeText');
            
            if (isDark) {
                icon.className = 'fas fa-sun';
                text.textContent = 'Modo Claro';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = 'Modo Oscuro';
            }
        }

        // Verificar modo oscuro al cargar
        function checkDarkMode() {
            if (localStorage.getItem('darkMode') === 'enabled') {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeIcon').className = 'fas fa-sun';
                document.getElementById('darkModeText').textContent = 'Modo Claro';
            }
        }

        // Mostrar favoritos
        function showFavorites() {
            if (favorites.length === 0) {
                showNotification('No tienes canciones favoritas');
                return;
            }
            
            // En una implementación real, aquí cargaríamos las canciones favoritas
            showNotification('Mostrando canciones favoritas');
        }

        // Añadir búsqueda al historial
        function addToSearchHistory(query) {
            if (!searchHistory.includes(query)) {
                searchHistory.unshift(query);
                if (searchHistory.length > 10) searchHistory.pop();
                localStorage.setItem('musicSearchHistory', JSON.stringify(searchHistory));
                // Actualizar la UI del historial si es necesario
            }
        }

        // Cargar historial de búsqueda
        function loadSearchHistory() {
            // En una implementación completa, mostraríamos el historial en la UI
        }

        // Iniciar la aplicación
        document.addEventListener('DOMContentLoaded', init);