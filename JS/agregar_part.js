// Variables globales
let currentScore = null;
const VF = Vex.Flow;

// Función principal cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si VexFlow está cargado
    if (typeof Vex === 'undefined' || typeof VF === 'undefined') {
        loadVexFlowLibrary();
    } else {
        initializeApp();
    }
});

/**
 * Carga la biblioteca VexFlow desde CDN
 */
function loadVexFlowLibrary() {
    try {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/vexflow@3.0.9/releases/vexflow-min.js';
        script.onload = initializeApp;
        script.onerror = function() {
            showMessage('Error al cargar la biblioteca de partituras', 'danger');
        };
        document.head.appendChild(script);
    } catch (error) {
        console.error('Error al cargar VexFlow:', error);
        showMessage('Error crítico: No se puede cargar el editor de partituras', 'danger');
    }
}

/**
 * Inicializa la aplicación después de cargar las dependencias
 */
function initializeApp() {
    try {
        // Configurar controles de organización
        setupOrganizationControls();
        
        // Cargar partituras guardadas
        loadSavedScores();
        
        // Configurar modo oscuro si existe
        if (typeof setupDarkMode === 'function') {
            setupDarkMode();
        }
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showMessage('Error al iniciar la aplicación', 'danger');
    }
}

/**
 * Configura los controles de organización de la interfaz
 */
function setupOrganizationControls() {
    try {
        const controls = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="d-flex align-items-center">
                    <h1 class="mb-0 me-3"><i class="fas fa-music me-2"></i>Mis Partituras</h1>
                    <span class="badge bg-primary rounded-pill" id="totalScores">0</span>
                </div>
            </div>
            <div class="btn-group my-4">
                <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ordenar partituras">
                    <i class="fas fa-sort me-1"></i> Ordenar
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item sort-option" href="#" data-sort="date-desc">Más recientes</a></li>
                    <li><a class="dropdown-item sort-option" href="#" data-sort="date-asc">Más antiguas</a></li>
                    <li><a class="dropdown-item sort-option" href="#" data-sort="name-asc">Nombre (A-Z)</a></li>
                    <li><a class="dropdown-item sort-option" href="#" data-sort="name-desc">Nombre (Z-A)</a></li>
                </ul>
                <button id="newScoreBtn" class="btn btn-primary" aria-label="Crear nueva partitura">
                    <i class="fas fa-plus me-2"></i> Nueva
                </button>
            </div>
        `;
        
        document.getElementById('organization-controls').innerHTML = controls;
        
        // Event listeners
        document.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                sortScores(option.dataset.sort);
            });
        });
        
        document.getElementById('newScoreBtn').addEventListener('click', () => {
            window.location.href = 'partitura.html';
        });
        
    } catch (error) {
        console.error('Error al configurar controles:', error);
        showMessage('Error al cargar los controles', 'danger');
    }
}

/**
 * Carga las partituras guardadas en localStorage
 */
function loadSavedScores() {
    try {
        showLoadingState();
        
        const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
        
        // Validar estructura de datos
        if (!Array.isArray(savedScores)) {
            throw new Error('Formato de partituras guardadas no válido');
        }
        
        if (savedScores.length === 0) {
            showEmptyState();
            return;
        }
        
        renderScoreCards(savedScores);
        setupSearchAndFilter();
        
    } catch (error) {
        showErrorState(error);
    }
}

/**
 * Muestra el estado de carga
 */
function showLoadingState() {
    const container = document.getElementById('scores-container');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando partituras...</p>
        </div>
    `;
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Muestra el estado cuando no hay partituras
 */
function showEmptyState() {
    document.getElementById('scores-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('totalScores').textContent = '0';
}

/**
 * Muestra el estado de error
 * @param {Error} error - Objeto de error
 */
function showErrorState(error) {
    console.error('Error al cargar partituras:', error);
    document.getElementById('empty-state').innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error al cargar partituras
            <button class="btn btn-sm btn-outline-danger ms-3" onclick="location.reload()">
                <i class="fas fa-sync-alt me-1"></i> Reintentar
            </button>
        </div>
    `;
    document.getElementById('empty-state').style.display = 'flex';
}

/**
 * Renderiza las tarjetas de partituras
 * @param {Array} scores - Array de partituras
 */
function renderScoreCards(scores) {
    try {
        const container = document.getElementById('scores-container');
        container.innerHTML = '';
        container.style.display = 'flex';
        
        document.getElementById('totalScores').textContent = scores.length;
        
        scores.forEach((score, index) => {
            const card = createScoreCard(score, index);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error al renderizar partituras:', error);
        showMessage('Error al mostrar las partituras', 'danger');
    }
}

/**
 * Crea una tarjeta de partitura
 * @param {Object} score - Objeto de partitura
 * @param {number} index - Índice de la partitura
 * @returns {HTMLElement} Elemento DOM de la tarjeta
 */
function createScoreCard(score, index) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const clefIcon = getClefIcon(score.clef);
    const previewNotes = getPreviewNotes(score.notes);
    
    col.innerHTML = `
        <div class="card score-card h-100" data-index="${index}" data-clef="${score.clef}" data-time-sig="${score.timeSignature}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="card-title mb-3">${score.name || 'Partitura sin nombre'}</h5>
                    <span class="badge bg-secondary">${score.notes.length} notas</span>
                </div>
                <div class="mb-3">
                    <div class="vex-preview mb-2">${renderMiniPreview(score)}</div>
                    <small class="text">${previewNotes}</small>
                </div>
                <div class="d-flex flex-wrap gap-2 mb-2">
                    <span class="badge bg-primary">${clefIcon} ${getClefName(score.clef)}</span>
                    <span class="badge bg-secondary">${score.timeSignature}</span>
                    <span class="badge bg-info text">${score.keySignature}</span>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary download-pdf" aria-label="Descargar PDF">
                    <i class="fas fa-file-pdf me-1"></i> PDF
                </button>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-success edit-score" aria-label="Editar partitura">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-score" aria-label="Eliminar partitura">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Configurar eventos
    const card = col.querySelector('.score-card');
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn')) {
            showScoreModal(score);
        }
    });
    
    col.querySelector('.edit-score').addEventListener('click', (e) => {
        e.stopPropagation();
        openScoreForEditing(score);
    });
    
    col.querySelector('.delete-score').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteScore(index);
    });
    
    col.querySelector('.download-pdf').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadPdf(score);
    });
    
    return col;
}

/**
 * Obtiene el icono de clave musical
 * @param {string} clef - Tipo de clave
 * @returns {string} HTML del icono
 */
function getClefIcon(clef) {
    switch(clef) {
        case 'treble': return '<i class="fas fa-music clef-icon" title="Clave de Sol"></i>';
        case 'bass': return '<i class="fas fa-music clef-icon flipped" title="Clave de Fa"></i>';
        default: return '<i class="fas fa-italic clef-icon" title="Clave de Do"></i>';
    }
}

/**
 * Obtiene el nombre de la clave musical
 * @param {string} clef - Tipo de clave
 * @returns {string} Nombre de la clave
 */
function getClefName(clef) {
    switch(clef) {
        case 'treble': return 'Clave de Sol';
        case 'bass': return 'Clave de Fa';
        case 'alto': return 'Clave de Do';
        default: return clef;
    }
}

/**
 * Obtiene una vista previa de las notas
 * @param {Array} notes - Array de notas
 * @returns {string} Texto de vista previa
 */
function getPreviewNotes(notes) {
    const noteNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
    const preview = notes.slice(0, 3).map(note => {
        return note.duration.endsWith('r') 
            ? getDurationSymbol(note.duration)
            : `${noteNames[note.keys[0].split('/')[0]] || note.keys[0]} (${getDurationSymbol(note.duration)})`;
    });
    return notes.length > 3 ? [...preview, '...'].join(', ') : preview.join(', ');
}

/**
 * Obtiene el símbolo de duración de nota
 * @param {string} duration - Duración de la nota
 * @returns {string} Símbolo musical
 */
function getDurationSymbol(duration) {
    const symbols = {
        'w': '𝅝', 'h': '𝅗𝅥', 'q': '𝅘𝅥', '8': '𝅘𝅥𝅮', '16': '𝅘𝅥𝅯',
        'wr': '𝄻', 'hr': '𝄼', 'qr': '𝄽', '8r': '𝄾', '16r': '𝄿'
    };
    return symbols[duration] || duration;
}

/**
 * Renderiza una vista previa miniaturizada de la partitura
 * @param {Object} score - Objeto de partitura
 * @returns {string} HTML del renderizado
 */
function renderMiniPreview(score) {
    try {
        if (!VF || !VF.Renderer) {
            throw new Error('VexFlow no está cargado correctamente');
        }
        
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '40px';
        div.style.overflow = 'hidden';
        
        const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
        renderer.resize(300, 40);
        const context = renderer.getContext();
        
        const stave = new VF.Stave(10, 0, 280);
        stave.addClef(score.clef);
        if (score.keySignature) stave.addKeySignature(score.keySignature);
        stave.setContext(context).draw();
        
        // Limitar a 4 notas para la vista previa
        const previewNotes = score.notes.slice(0, 4).map(note => {
            try {
                return new VF.StaveNote({
                    keys: note.keys,
                    duration: note.duration,
                    clef: note.clef || score.clef,
                    auto_stem: true
                });
            } catch (error) {
                console.error('Error al crear nota:', note, error);
                return null;
            }
        }).filter(note => note !== null);
        
        if (previewNotes.length > 0) {
            new VF.Formatter()
                .joinVoices([new VF.Voice().addTickables(previewNotes)])
                .format([previewNotes], 200);
            
            previewNotes.forEach(note => note.setContext(context).draw());
        }
        
        return div.innerHTML;
    } catch (error) {
        console.error('Error al renderizar mini preview:', error);
        return '<div class="text-muted">Vista previa no disponible</div>';
    }
}

/**
 * Configura la búsqueda y filtrado de partituras
 */
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchScores');
    const filterClef = document.getElementById('clef');
    const filterTimeSig = document.getElementById('timeSignature');
    
    if (!searchInput || !filterClef || !filterTimeSig) return;
    
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const clefFilter = filterClef.value;
        const timeSigFilter = filterTimeSig.value;
        
        let visibleCount = 0;
        
        document.querySelectorAll('.score-card').forEach(card => {
            const name = card.querySelector('.card-title').textContent.toLowerCase();
            const clef = card.dataset.clef;
            const timeSig = card.dataset.timeSig;
            
            const matchesSearch = searchTerm === '' || name.includes(searchTerm);
            const matchesClef = clefFilter === '' || clef === clefFilter;
            const matchesTimeSig = timeSigFilter === '' || timeSig === timeSigFilter;
            
            if (matchesSearch && matchesClef && matchesTimeSig) {
                card.parentElement.style.display = '';
                visibleCount++;
            } else {
                card.parentElement.style.display = 'none';
            }
        });
        
        document.getElementById('totalScores').textContent = visibleCount;
    };
    
    searchInput.addEventListener('input', applyFilters);
    filterClef.addEventListener('change', applyFilters);
    filterTimeSig.addEventListener('change', applyFilters);
}

/**
 * Ordena las partituras según el método especificado
 * @param {string} method - Método de ordenación
 */
function sortScores(method) {
    try {
        const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
        
        if (!Array.isArray(savedScores)) {
            throw new Error('Datos de partituras no válidos');
        }
        
        switch(method) {
            case 'date-desc':
                savedScores.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                break;
            case 'date-asc':
                savedScores.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
                break;
            case 'name-asc':
                savedScores.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name-desc':
                savedScores.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
        }
        
        localStorage.setItem('savedScores', JSON.stringify(savedScores));
        renderScoreCards(savedScores);
    } catch (error) {
        console.error('Error al ordenar partituras:', error);
        showMessage('Error al ordenar partituras', 'danger');
    }
}

/**
 * Abre una partitura para edición
 * @param {Object} score - Objeto de partitura
 */
function openScoreForEditing(score) {
    try {
        localStorage.setItem('currentScoreToLoad', JSON.stringify(score));
        window.location.href = 'partitura.html';
    } catch (error) {
        console.error('Error al abrir partitura:', error);
        showMessage('Error al abrir la partitura', 'danger');
    }
}

/**
 * Elimina una partitura
 * @param {number} index - Índice de la partitura a eliminar
 */
function deleteScore(index) {
    if (!confirm('¿Estás seguro de eliminar esta partitura?')) return;
    
    try {
        const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
        savedScores.splice(index, 1);
        localStorage.setItem('savedScores', JSON.stringify(savedScores));
        
        loadSavedScores();
        showMessage('Partitura eliminada', 'success');
    } catch (error) {
        console.error('Error al eliminar partitura:', error);
        showMessage('Error al eliminar la partitura', 'danger');
    }
}

/**
 * Muestra un modal con la partitura completa
 * @param {Object} score - Objeto de partitura
 */
function showScoreModal(score) {
    currentScore = score;
    const modal = new bootstrap.Modal(document.getElementById('scoreModal'));
    
    document.getElementById('scoreModalTitle').textContent = score.name || 'Partitura';
    const container = document.getElementById('modal-score-content');
    container.innerHTML = '<div id="vexflow-render-container"></div>';
    
    try {
        const renderer = new VF.Renderer(
            document.getElementById('vexflow-render-container'),
            VF.Renderer.Backends.SVG
        );
        
        renderer.resize(container.clientWidth, 400);
        const context = renderer.getContext();
        
        const system = new VF.System({
            x: 0,
            y: 0,
            width: container.clientWidth,
            spaceBetweenStaves: 10
        });
        
        const vexNotes = score.notes.map(note => {
            try {
                return new VF.StaveNote({
                    keys: note.keys,
                    duration: note.duration,
                    clef: note.clef || score.clef,
                    auto_stem: true
                });
            } catch (error) {
                console.error('Error al crear nota:', note, error);
                return null;
            }
        }).filter(note => note !== null);
        
        const stave = system.addStave({
            voices: [
                new VF.Voice({
                    num_beats: score.timeSignature.split('/')[0],
                    beat_value: score.timeSignature.split('/')[1],
                    resolution: VF.RESOLUTION
                }).addTickables(vexNotes)
            ]
        });
        
        stave.addClef(score.clef)
             .addTimeSignature(score.timeSignature)
             .addKeySignature(score.keySignature);
        
        system.format();
        system.draw(context);
        
        document.getElementById('downloadPdfBtn').onclick = () => {
            modal.hide();
            downloadPdf(score);
        };
        
    } catch (error) {
        console.error('Error al renderizar partitura:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar la partitura
            </div>
        `;
    }
    
    modal.show();
}

/**
 * Descarga la partitura como PDF
 * @param {Object} score - Objeto de partitura
 */
function downloadPdf(score) {
    // Verificar si jsPDF está disponible
    if (!window.jspdf) {
        // Cargar jsPDF dinámicamente si no está disponible
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            showMessage('Biblioteca PDF cargada, intenta nuevamente', 'info');
        };
        script.onerror = () => {
            showMessage('Error al cargar la biblioteca PDF', 'danger');
        };
        document.head.appendChild(script);
        return;
    }

    showMessage('Generando PDF...', 'info');
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.height = '600px';
    document.body.appendChild(tempContainer);
    
    try {
        const renderer = new VF.Renderer(tempContainer, VF.Renderer.Backends.SVG);
        renderer.resize(800, 600);
        const context = renderer.getContext();
        
        const system = new VF.System({
            x: 10,
            y: 20,
            width: 780,
            spaceBetweenStaves: 30
        });
        
        const vexNotes = score.notes.map(note => {
            try {
                return new VF.StaveNote({
                    keys: note.keys,
                    duration: note.duration,
                    clef: note.clef || score.clef,
                    auto_stem: true
                });
            } catch (error) {
                console.error('Error al crear nota:', note, error);
                return null;
            }
        }).filter(note => note !== null);
        
        const stave = system.addStave({
            voices: [
                new VF.Voice({
                    num_beats: score.timeSignature.split('/')[0],
                    beat_value: score.timeSignature.split('/')[1],
                    resolution: VF.RESOLUTION
                }).addTickables(vexNotes)
            ]
        });
        
        stave.addClef(score.clef)
             .addTimeSignature(score.timeSignature)
             .addKeySignature(score.keySignature);
        
        system.format();
        system.draw(context);
        
        setTimeout(() => {
            const svgElement = tempContainer.querySelector('svg');
            if (!svgElement) throw new Error('No se pudo generar la partitura');
            
            const serializer = new XMLSerializer();
            const svgStr = serializer.serializeToString(svgElement);
            const svgBlob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                generatePdfFromImage(img, score);
                URL.revokeObjectURL(url);
                document.body.removeChild(tempContainer);
            };
            img.onerror = function() {
                document.body.removeChild(tempContainer);
                throw new Error('Error al convertir SVG a imagen');
            };
            img.src = url;
            
        }, 500);
        
    } catch (error) {
        document.body.removeChild(tempContainer);
        console.error('Error al generar PDF:', error);
        showMessage('Error al generar PDF', 'danger');
    }
}

/**
 * Genera un PDF a partir de una imagen renderizada
 * @param {Image} img - Imagen de la partitura
 * @param {Object} score - Objeto de partitura
 */
function generatePdfFromImage(img, score) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const widthInPoints = 8.5 * 72; // Tamaño carta en puntos (1 pulgada = 72 puntos)
        const heightInPoints = 11 * 72;
        canvas.width = widthInPoints;
        canvas.height = heightInPoints;
        
        const scale = Math.min(
            (widthInPoints * 0.9) / img.width, 
            (heightInPoints * 0.9) / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (widthInPoints - scaledWidth) / 2;
        const y = (heightInPoints - scaledHeight) / 2;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, widthInPoints, heightInPoints);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Añadir metadatos
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText(score.name || 'Partitura sin nombre', widthInPoints / 2, 30);
        ctx.font = '10px Arial';
        ctx.fillText(`Generado con ConvertMusic - ${new Date().toLocaleDateString()}`, widthInPoints / 2, heightInPoints - 20);
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [widthInPoints, heightInPoints]
        });
        
        pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            0,
            0,
            widthInPoints,
            heightInPoints
        );
        
        pdf.save(`${(score.name || 'partitura').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        showDownloadNotification(score.name);
        
    } catch (error) {
        console.error('Error al crear PDF:', error);
        showMessage('Error al crear PDF', 'danger');
    }
}

/**
 * Muestra una notificación de descarga completada
 * @param {string} scoreName - Nombre de la partitura
 */
function showDownloadNotification(scoreName) {
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <div>
            <div style="font-weight:bold;">¡Descarga completada!</div>
            <div style="font-size:0.9em;">"${scoreName || 'Partitura'}"</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Muestra un mensaje temporal en la interfaz
 * @param {string} text - Texto del mensaje
 * @param {string} type - Tipo de mensaje (success, danger, info, etc.)
 */
function showMessage(text, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    messageEl.style.zIndex = '1000';
    messageEl.setAttribute('role', 'alert');
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${text}
    `;
    document.body.appendChild(messageEl);
    
    setTimeout(() => messageEl.remove(), 3000);
}