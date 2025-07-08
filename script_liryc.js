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
                try {
                    const content = JSON.parse(data.contents);
                    if (content.error) {
                        // Si no se encuentra la letra, buscar sugerencias y mostrar el video
                        showVideoAndSuggestions(artist, title);
                    } else {
                        searchYoutubeVideo(artist, title, content.lyrics);
                    }
                } catch (e) {
                    console.error('Error parsing lyrics:', e);
                    showVideoAndSuggestions(artist, title);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showVideoAndSuggestions(artist, title);
            });
    }

    // Función para mostrar video y sugerencias cuando no se encuentra la letra
    function showVideoAndSuggestions(artist, title) {
        // Primero buscar el video de YouTube
        searchYoutubeVideo(artist, title, null, () => {
            // Luego buscar sugerencias de canciones
            if (artist) {
                searchArtistTracks(artist, false);
            } else {
                searchSongsByTitle(title);
            }
        });
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

    // Función para mostrar solo el video (cuando no hay letra)
    function displayVideoOnly(artist, title, videoId) {
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
                <h2>Canciones de ${artist}</h2>
                <p>Selecciona una canción para ver su letra:</p>
                <ul class="track-list">
        `;

        limitedTracks.forEach(track => {
            tracksHTML += `
                <li onclick="searchTrack('${track.artist.name.replace("'", "\\'")}', '${track.title.replace("'", "\\'")}')">
                    <i class="fas fa-play-circle"></i> ${track.title}
                </li>
            `;
        });

        tracksHTML += `</ul></div>`;
        resultsDiv.innerHTML = tracksHTML;
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
                <div class="suggestion-item" onclick="searchTrack('${track.artist.name.replace("'", "\\'")}', '${track.title.replace("'", "\\'")}')">
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

    // Función global para buscar desde la lista de canciones
    window.searchTrack = function(artist, title) {
        artistInput.value = artist;
        titleInput.value = title;
        searchLyrics();
    };

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

    // Agregar al script_liryc.js
function setupAutocomplete(inputElement, type) {
    inputElement.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length < 2) return;

        const apiUrl = type === 'artist' 
            ? `https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}` 
            : `https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`;

        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`)
            .then(response => response.json())
            .then(data => {
                const content = JSON.parse(data.contents);
                if (content.data) {
                    showAutocompleteSuggestions(inputElement, content.data, type);
                }
            })
            .catch(console.error);
    });
}

function showAutocompleteSuggestions(inputElement, items, type) {
    const dropdown = document.createElement('div');
    dropdown.className = 'suggestions-dropdown';
    items.slice(0, 5).forEach(item => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.textContent = type === 'artist' ? item.artist.name : item.title;
        suggestion.addEventListener('click', () => {
            inputElement.value = type === 'artist' ? item.artist.name : item.title;
            dropdown.remove();
        });
        dropdown.appendChild(suggestion);
    });
    inputElement.parentNode.appendChild(dropdown);
}

// Llamar en DOMContentLoaded
setupAutocomplete(artistInput, 'artist');
setupAutocomplete(titleInput, 'title');

});