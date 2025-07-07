// Inicializar jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const artistInput = document.getElementById('artist');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');
    let player = null;

    // Configuración de APIs
    const API_CONFIG = {
        GENIUS: {
            BASE_URL: 'https://api.genius.com',
            TOKEN: 'lmDCtevEVtl5KcsrV_8gxADMM9yNgrmINDnb6jczKSyEoGJEIHNC_NBgqsto26V-',
            HEADERS: {
                'Authorization': 'Bearer lmDCtevEVtl5KcsrV_8gxADMM9yNgrmINDnb6jczKSyEoGJEIHNC_NBgqsto26V-'
            }
        },
        LYRICS_OVH_ALT: {
            BASE_URL: 'https://some-random-api.ml/lyrics',
            FALLBACK_URL: 'https://lyrics-api.vercel.app/api/lyrics'
        },
        YOUTUBE: {
            KEY: 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac'
        }
    };

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
            searchLyricsFromMultipleSources(artist, title);
        } else if (artist) {
            searchArtistTracks(artist, true);
        } else {
            searchSongsByTitle(title);
        }
    }

    // Función para buscar letras de múltiples fuentes
    async function searchLyricsFromMultipleSources(artist, title) {
        try {
            // Intentar primero con Genius (la fuente más confiable)
            let lyrics = await searchGeniusLyrics(artist, title);
            
            // Si Genius no devuelve letras, intentar con fuentes alternativas
            if (!lyrics) {
                lyrics = await searchLyricsOvhAlternative(artist, title);
            }

            if (lyrics) {
                await searchYoutubeVideo(artist, title, lyrics);
            } else {
                showError('No se pudo encontrar la letra. Intenta con una búsqueda más específica.');
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showError('Ocurrió un error al buscar la letra. Intenta nuevamente.');
        }
    }

    // Función para buscar letras en Genius
    async function searchGeniusLyrics(artist, title) {
        try {
            // Paso 1: Buscar la canción en Genius
            const searchUrl = `${API_CONFIG.GENIUS.BASE_URL}/search?q=${encodeURIComponent(title + ' ' + artist)}`;
            
            const searchResponse = await fetch(searchUrl, {
                headers: API_CONFIG.GENIUS.HEADERS
            });
            
            if (!searchResponse.ok) {
                console.log('Genius search failed:', searchResponse.status);
                return null;
            }
            
            const searchData = await searchResponse.json();
            const song = searchData.response?.hits?.[0]?.result;
            
            if (!song) {
                console.log('Canción no encontrada en Genius');
                return null;
            }
            
            // Paso 2: Obtener la URL de la letra
            const lyricsUrl = song.url;
            
            // Paso 3: Usar un proxy para evitar CORS y obtener el HTML de la letra
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(lyricsUrl)}`;
            const proxyResponse = await fetch(proxyUrl);
            
            if (!proxyResponse.ok) {
                console.log('Proxy request failed:', proxyResponse.status);
                return null;
            }
            
            const proxyData = await proxyResponse.json();
            
            // Paso 4: Extraer la letra del HTML
            return extractLyricsFromGeniusHTML(proxyData.contents);
        } catch (error) {
            console.error('Error en Genius API:', error);
            return null;
        }
    }

    // Función para extraer letras de HTML de Genius
    function extractLyricsFromGeniusHTML(html) {
        try {
            // Crear un documento temporal para parsear el HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Buscar el contenedor principal de letras
            const lyricsContainer = doc.querySelector('[data-lyrics-container="true"]');
            
            if (!lyricsContainer) {
                console.log('No se encontró el contenedor de letras');
                return null;
            }
            
            // Limpiar el texto
            let lyrics = lyricsContainer.innerHTML
                .replace(/<br>/g, '\n') // Reemplazar saltos de línea
                .replace(/<[^>]*>/g, '') // Eliminar todas las etiquetas HTML
                .replace(/^\s+|\s+$/g, ''); // Trim whitespace
                
            // Eliminar coros duplicados (común en Genius)
            lyrics = lyrics.replace(/(\[Coro:.*?\].*?\n.*?)(\[Coro:.*?\])/gs, '$1');
            
            return lyrics || null;
        } catch (error) {
            console.error('Error extrayendo letras:', error);
            return null;
        }
    }

    // Función para buscar letras en alternativas de lyrics.ovh
    async function searchLyricsOvhAlternative(artist, title) {
        const sources = [
            `${API_CONFIG.LYRICS_OVH_ALT.BASE_URL}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
            `${API_CONFIG.LYRICS_OVH_ALT.FALLBACK_URL}?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
        ];
        
        for (const url of sources) {
            try {
                const response = await fetch(url);
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const lyrics = data.lyrics || data.text || data.result?.lyrics;
                
                if (lyrics) {
                    return formatLyrics(lyrics);
                }
            } catch (error) {
                console.error(`Error con fuente ${url}:`, error);
                continue;
            }
        }
        
        return null;
    }

    // Formatear letras para consistencia
    function formatLyrics(lyrics) {
        if (!lyrics) return null;
        
        // Normalizar saltos de línea
        return lyrics.replace(/\r\n/g, '\n')
                    .replace(/\n+/g, '\n')
                    .trim();
    }

    // Función para buscar video en YouTube
    async function searchYoutubeVideo(artist, title, lyrics) {
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artist + ' ' + title)}&key=${API_CONFIG.YOUTUBE.KEY}&maxResults=1`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('No se pudo obtener el video de YouTube');
            }
            
            const data = await response.json();
            const videoId = data.items?.[0]?.id?.videoId || '';
            
            displayResults(artist, title, lyrics, videoId);
        } catch (error) {
            console.error('Error al buscar el video:', error);
            displayResults(artist, title, lyrics);
        }
    }

    // Función para mostrar resultados
    function displayResults(artist, title, lyrics, videoId = '') {
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
                        <button id="copyBtn" class="copy-btn" title="Copiar letra">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                ${videoEmbed}
                <pre class="lyrics">${lyrics}</pre>
            </div>
        `;

        // Configurar botón de descarga PDF
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            downloadLyricsAsPDF(artist, title, lyrics);
        });

        // Configurar botón de copiar letra
        document.getElementById('copyBtn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(lyrics)
                .then(() => {
                    const copyBtn = document.getElementById('copyBtn');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                });
        });

        // Inicializar reproductor si hay video
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

    // Función para buscar canciones de un artista
    async function searchArtistTracks(artist, isPrimarySearch = false) {
        try {
            // Intentar primero con Genius
            const songs = await searchGeniusArtistSongs(artist);
            
            if (songs && songs.length > 0) {
                displayArtistResults(artist, songs);
                return;
            }
            
            // Si Genius falla, intentar con la API alternativa
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(artist)}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            
            if (!response.ok) {
                throw new Error('No se pudieron obtener las canciones del artista');
            }
            
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.data && content.data.length > 0) {
                displayArtistResults(artist, content.data);
            } else if (isPrimarySearch) {
                showError(`No se encontraron canciones para ${artist}`);
            }
        } catch (error) {
            console.error('Error al buscar canciones del artista:', error);
            if (isPrimarySearch) {
                showError('Error al buscar canciones del artista');
            }
        }
    }

    // Buscar canciones de artista en Genius
    async function searchGeniusArtistSongs(artist) {
        try {
            const apiUrl = `${API_CONFIG.GENIUS.BASE_URL}/search?q=${encodeURIComponent(artist)}&per_page=10`;
            
            const response = await fetch(apiUrl, {
                headers: API_CONFIG.GENIUS.HEADERS
            });
            
            if (!response.ok) return null;
            
            const data = await response.json();
            const hits = data.response?.hits || [];
            
            return hits.map(hit => ({
                title: hit.result.title,
                artist: { name: hit.result.primary_artist.name },
                album: hit.result.album
            }));
        } catch (error) {
            console.error('Error al buscar artista en Genius:', error);
            return null;
        }
    }

    // Mostrar resultados de artista
    function displayArtistResults(artist, tracks) {
        const limitedTracks = tracks.slice(0, 15);
        let tracksHTML = `
            <div class="artist-results">
                <h2>Canciones de ${artist}</h2>
                <p>Selecciona una canción para ver su letra:</p>
                <ul class="track-list">
        `;

        limitedTracks.forEach(track => {
            const safeArtist = track.artist.name.replace(/'/g, "\\'");
            const safeTitle = track.title.replace(/'/g, "\\'");
            tracksHTML += `
                <li onclick="searchTrack('${safeArtist}', '${safeTitle}')">
                    <i class="fas fa-music"></i> ${track.title}
                    ${track.album ? `<span class="album-name">(${track.album.name})</span>` : ''}
                </li>
            `;
        });

        tracksHTML += `</ul></div>`;
        resultsDiv.innerHTML = tracksHTML;
    }

    // Función para buscar canciones por título
    async function searchSongsByTitle(title) {
        try {
            // Intentar primero con Genius
            const songs = await searchGeniusSongsByTitle(title);
            
            if (songs && songs.length > 0) {
                displaySongResults(title, songs);
                return;
            }
            
            // Si Genius falla, intentar con la API alternativa
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(title)}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            
            if (!response.ok) {
                throw new Error('No se pudieron encontrar canciones con ese título');
            }
            
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

    // Buscar canciones por título en Genius
    async function searchGeniusSongsByTitle(title) {
        try {
            const apiUrl = `${API_CONFIG.GENIUS.BASE_URL}/search?q=${encodeURIComponent(title)}&per_page=10`;
            
            const response = await fetch(apiUrl, {
                headers: API_CONFIG.GENIUS.HEADERS
            });
            
            if (!response.ok) return null;
            
            const data = await response.json();
            const hits = data.response?.hits || [];
            
            return hits.map(hit => ({
                title: hit.result.title,
                artist: { name: hit.result.primary_artist.name },
                album: hit.result.album
            }));
        } catch (error) {
            console.error('Error al buscar canciones en Genius:', error);
            return null;
        }
    }

    // Mostrar resultados de canciones
    function displaySongResults(title, songs) {
        const limitedSongs = songs.slice(0, 15);
        let songsHTML = `
            <div class="song-results">
                <h2>Canciones que coinciden con "${title}"</h2>
                <p>Selecciona una canción para ver su letra:</p>
                <div class="songs-list">
        `;

        limitedSongs.forEach(song => {
            const safeArtist = song.artist.name.replace(/'/g, "\\'");
            const safeTitle = song.title.replace(/'/g, "\\'");
            songsHTML += `
                <div class="song-item" onclick="searchTrack('${safeArtist}', '${safeTitle}')">
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

    // Descargar letras como PDF
    function downloadLyricsAsPDF(artist, title, lyrics) {
        const doc = new jsPDF();
        doc.setProperties({
            title: `${title} - ${artist}`,
            subject: 'Letra de canción',
            author: 'Lyrics Finder'
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

    // Mostrar estado de carga
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

    // Mostrar mensaje de error
    function showError(message) {
        let errorMessage = message;
        
        if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            errorMessage = 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
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

    // Mostrar/ocultar botones de limpiar inputs
    ['artist', 'title'].forEach(id => {
        const input = document.getElementById(id);
        const clearBtn = document.querySelector(`.clear-input[data-target="${id}"]`);
        
        input.addEventListener('input', function() {
            clearBtn.style.opacity = this.value ? '1' : '0';
        });
    });

    // Limpiar inputs
    document.querySelectorAll('.clear-input').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).value = '';
            this.style.opacity = '0';
            document.getElementById(targetId).focus();
        });
    });
});