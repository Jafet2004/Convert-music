// Inicializar jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const artistInput = document.getElementById('artist');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    let player = null;

    // Event listeners para búsqueda
    searchBtn.addEventListener('click', searchLyrics);
    artistInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchLyrics());
    titleInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchLyrics());

    // Función principal de búsqueda
    function searchLyrics() {
        const artist = artistInput.value.trim();
        const title = titleInput.value.trim();

        if (!artist && !title) {
            showError('Por favor ingresa al menos un artista o una canción');
            return;
        }

        showLoading();
        resetPlayer();

        if (artist && title) {
            searchLyricsApi(artist, title);
        } else if (artist) {
            searchArtistTracks(artist, true);
        } else {
            searchSongsByTitle(title);
        }
    }

    // Función para buscar letras
    function searchLyricsApi(artist, title) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) throw new Error('No se pudo obtener la letra');
                return response.json();
            })
            .then(data => {
                const content = JSON.parse(data.contents);
                if (content.error) throw new Error(content.error || 'Letra no encontrada');
                searchYoutubeVideo(artist, title, content.lyrics);
            })
            .catch(error => {
                showError(error.message || 'Ocurrió un error al buscar la letra');
                console.error('Error:', error);
            });
    }

    // Función para buscar video en YouTube
    function searchYoutubeVideo(artist, title, lyrics) {
        const apiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac';
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artist + ' ' + title)}&key=${apiKey}&maxResults=1`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('No se pudo obtener el video de YouTube');
                return response.json();
            })
            .then(data => {
                const videoId = data.items?.[0]?.id?.videoId || '';
                displayResults(artist, title, lyrics, videoId);
            })
            .catch(error => {
                console.error('Error al buscar el video:', error);
                displayResults(artist, title, lyrics);
            });
    }

    // Función para mostrar resultados
    function displayResults(artist, title, lyrics, videoId) {
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

        resultsDiv.innerHTML = `
            <div class="lyrics-container">
                <div class="song-info">
                    <div>
                        <h2 class="song-title">${title}</h2>
                        <h3 class="artist-name">${artist}</h3>
                    </div>
                    <div class="action-buttons">
                        <button id="downloadBtn" class="download-btn">
                            <i class="fas fa-file-pdf"></i> Descargar PDF
                        </button>
                    </div>
                </div>
                ${videoEmbed}
                <div class="lyrics">${lyrics}</div>
            </div>
        `;

        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            downloadLyricsAsPDF(artist, title, lyrics);
        });

        if (videoId) {
            initializePlayer(videoId);
        }
    }

    // Inicializar el reproductor de YouTube
    function initializePlayer(videoId) {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = function() {
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
                'onReady': onPlayerReady
            }
        });
    }

    // Cuando el reproductor está listo
function onPlayerReady(event) {
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            // Verificar el estado actual del reproductor
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                event.target.pauseVideo();
                this.classList.remove('playing');
                this.innerHTML = '<i class="fas fa-play"></i> Reproducir <span class="pulse-animation"></span>';
            } else {
                event.target.playVideo();
                this.classList.add('playing');
                this.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            }
        });
    }
}

    // Resetear el reproductor
    function resetPlayer() {
        if (player) {
            player.destroy();
            player = null;
        }
    }

    // Resto de funciones se mantienen igual...
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
                        if (isPrimarySearch) displayArtistResults(artist, content.data);
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
                <h2>Canciones de ${artist}</h2>
                <p>Selecciona una canción para ver su letra:</p>
                <ul class="track-list">
        `;

        limitedTracks.forEach(track => {
            tracksHTML += `
                <li onclick="searchTrack('${track.artist.name.replace("'", "\\'")}', '${track.title.replace("'", "\\'")}')">
                    <i class="fas fa-music"></i> ${track.title}
                </li>
            `;
        });

        tracksHTML += `</ul></div>`;
        resultsDiv.innerHTML = tracksHTML;
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
                <h2>Canciones que coinciden con "${title}"</h2>
                <p>Selecciona una canción para ver su letra:</p>
                <div class="songs-list">
        `;

        limitedSongs.forEach(song => {
            songsHTML += `
                <div class="song-item" onclick="searchTrack('${song.artist.name.replace("'", "\\'")}', '${song.title.replace("'", "\\'")}')">
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
    }

    function downloadLyricsAsPDF(artist, title, lyrics) {
        const doc = new jsPDF();
        doc.setProperties({
            title: `${title} - ${artist}`,
            subject: 'Letra de canción',
            author: 'ConvertMusic'
        });

        doc.setFont('helvetica');
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(title, 105, 20, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text(artist, 105, 30, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        const splitLines = doc.splitTextToSize(lyrics, 180);
        doc.text(splitLines, 15, 45);

        doc.save(`${artist} - ${title}.pdf`);
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
        resultsDiv.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p>${message}</p>
            </div>
        `;
    }

    // Función global para buscar desde la lista de canciones
    window.searchTrack = function(artist, title) {
        artistInput.value = artist;
        titleInput.value = title;
        searchLyrics();
    };

    function showError(message) {
    let errorMessage = message;
    
    // Verificar si el error es de conexión
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

// Agregar al final del archivo, antes del cierre del event listener DOMContentLoaded

// Función para limpiar inputs
document.querySelectorAll('.clear-input').forEach(button => {
    button.addEventListener('click', function() {
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
    
    input.addEventListener('input', function() {
        clearBtn.style.opacity = this.value ? '1' : '0';
    });
});
});


