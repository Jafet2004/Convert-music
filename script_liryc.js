// Inicializar jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const artistInput = document.getElementById('artist');
    const titleInput = document.getElementById('title');
    const resultsDiv = document.getElementById('results');

    searchBtn.addEventListener('click', searchLyrics);

    // Búsqueda al presionar Enter en cualquiera de los campos
    artistInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchLyrics();
    });

    titleInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchLyrics();
    });

    function searchLyrics() {
        const artist = artistInput.value.trim();
        const title = titleInput.value.trim();

        if (!artist && !title) {
            showError('Por favor ingresa al menos un artista o una canción');
            return;
        }

        showLoading();

        if (artist && title) {
            // Buscar letra específica
            searchLyricsApi(artist, title);
        } else if (artist) {
            // Solo se ingresó artista, buscar sus canciones
            searchArtistTracks(artist, true);
        } else {
            // Solo se ingresó canción, buscar canciones con ese título
            searchSongsByTitle(title);
        }
    }

    function searchLyricsApi(artist, title) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo obtener la letra');
                }
                return response.json();
            })
            .then(data => {
                const content = JSON.parse(data.contents);

                if (content.error) {
                    throw new Error(content.error || 'Letra no encontrada');
                }

                searchYoutubeVideo(artist, title, content.lyrics);
                // También mostrar otras canciones del artista
                searchArtistTracks(artist);
            })
            .catch(error => {
                showError(error.message || 'Ocurrió un error al buscar la letra');
                console.error('Error:', error);
            });
    }

    function searchYoutubeVideo(artist, title, lyrics) {
        const apiKey = 'AIzaSyASUw8ilgowQR5_qVf9MkCcSNx-z1vfXac';
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artist + ' ' + title)}&key=${apiKey}&maxResults=1`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo obtener el video de YouTube');
                }
                return response.json();
            })
            .then(data => {
                let videoId = '';
                if (data.items && data.items.length > 0) {
                    videoId = data.items[0].id.videoId;
                }
                displayResults(artist, title, lyrics, videoId);
            })
            .catch(error => {
                console.error('Error al buscar el video:', error);
                displayResults(artist, title, lyrics);
            });
    }

    function displayResults(artist, title, lyrics, videoId) {
        let videoEmbed = '';
        if (videoId) {
            videoEmbed = `
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            `;
        }

        resultsDiv.innerHTML = `
            <div class="lyrics-container">
                <div class="song-info">
                    <div>
                        <h2 class="song-title">${title}</h2>
                        <h3 class="artist-name">${artist}</h3>
                    </div>
                    <div class="action-buttons">
                        <button id="downloadBtn" class="download-btn">Descargar PDF</button>
                    </div>
                </div>
                <div class="lyrics">${lyrics}</div>
                <div class="youtube-video">${videoEmbed}</div>
            </div>
        `;

        document.getElementById('downloadBtn').addEventListener('click', () => {
            downloadLyricsAsPDF(artist, title, lyrics);
        });
    }

    function searchArtistTracks(artist, isPrimarySearch = false) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(artist)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudieron obtener las canciones del artista');
                }
                return response.json();
            })
            .then(data => {
                try {
                    const content = JSON.parse(data.contents);
                    if (content.data && content.data.length > 0) {
                        if (isPrimarySearch) {
                            displayArtistResults(artist, content.data);
                        } else {
                            displayArtistTracks(artist, content.data);
                        }
                    } else {
                        if (isPrimarySearch) {
                            showError(`No se encontraron canciones para ${artist}`);
                        }
                    }
                } catch (e) {
                    console.error('Error al procesar canciones del artista:', e);
                    if (isPrimarySearch) {
                        showError('Error al procesar los resultados');
                    }
                }
            })
            .catch(error => {
                console.error('Error al buscar canciones del artista:', error);
                if (isPrimarySearch) {
                    showError('Error al buscar canciones del artista');
                }
            });
    }

    function searchSongsByTitle(title) {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `https://api.lyrics.ovh/suggest/${encodeURIComponent(title)}`;

        fetch(proxyUrl + encodeURIComponent(apiUrl))
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudieron encontrar canciones con ese título');
                }
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

    function displayArtistResults(artist, tracks) {
        // Limitar a 15 canciones
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
                    ${track.title}
                </li>
            `;
        });

        tracksHTML += `
                </ul>
            </div>
        `;

        resultsDiv.innerHTML = tracksHTML;
    }

    function displaySongResults(title, songs) {
        // Limitar a 15 canciones
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
                        <div class="song-item-title">${song.title}</div>
                        <div class="song-item-artist">${song.artist.name}</div>
                    </div>
                    <div>→</div>
                </div>
            `;
        });

        songsHTML += `
                </div>
            </div>
        `;

        resultsDiv.innerHTML = songsHTML;
    }

    function displayArtistTracks(artist, tracks) {
        // Limitar a 10 canciones
        const limitedTracks = tracks.slice(0, 10);

        let tracksHTML = `
            <div class="artist-tracks">
                <h3>Otras canciones de ${artist}</h3>
                <ul class="track-list">
        `;

        limitedTracks.forEach(track => {
            tracksHTML += `
                <li onclick="searchTrack('${track.artist.name.replace("'", "\\'")}', '${track.title.replace("'", "\\'")}')">
                    ${track.title}
                </li>
            `;
        });

        tracksHTML += `
                </ul>
            </div>
        `;

        const lyricsContainer = document.querySelector('.lyrics-container');
        if (lyricsContainer) {
            lyricsContainer.insertAdjacentHTML('afterend', tracksHTML);
        } else {
            resultsDiv.insertAdjacentHTML('beforeend', tracksHTML);
        }
    }

    function downloadLyricsAsPDF(artist, title, lyrics) {
        const doc = new jsPDF();

        // Configuración del documento
        doc.setProperties({
            title: `${title} - ${artist}`,
            subject: 'Letra de canción',
            author: 'ConvertMusic'
        });

        // Estilos
        doc.setFont('helvetica');
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);

        // Título de la canción
        doc.text(title, 105, 20, { align: 'center' });

        // Nombre del artista
        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text(artist, 105, 30, { align: 'center' });

        // Letra de la canción
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);

        // Dividir la letra en líneas que caben en el PDF
        const splitLines = doc.splitTextToSize(lyrics, 180);
        doc.text(splitLines, 15, 45);

        // Guardar el PDF
        doc.save(`${artist} - ${title}.pdf`);
    }

    function showLoading() {
        resultsDiv.innerHTML = '<div class="loading">Buscando...</div>';
    }

    function showError(message) {
        resultsDiv.innerHTML = `<div class="error-message">${message}</div>`;
    }

    // Función global para buscar desde la lista de canciones
    window.searchTrack = function(artist, title) {
        artistInput.value = artist;
        titleInput.value = title;
        searchLyrics();
    };
});
