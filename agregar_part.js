// Variables globales
let currentScore = null;
const fullscreenModal = new bootstrap.Modal(document.getElementById('fullscreenModal'));
const fullscreenScore = document.getElementById('fullscreen-score-content');

// Función para mostrar vista previa en pantalla completa
function showFullscreenPreview() {
    if (!currentScore || !currentScore.notes || currentScore.notes.length === 0) {
        showMessage('Debes agregar al menos una nota o silencio', 'danger');
        return;
    }

    fullscreenScore.innerHTML = '';
    const scoreClone = document.getElementById('vexflow-render-container').cloneNode(true);
    fullscreenScore.appendChild(scoreClone);

    const modalDialog = document.querySelector('#fullscreenModal .modal-dialog');
    modalDialog.classList.add('modal-xl');
    modalDialog.style.maxWidth = '95vw';

    fullscreenModal.show();

    document.getElementById('fullscreenModal').addEventListener('shown.bs.modal', function() {
        const svg = fullscreenScore.querySelector('svg');
        if (svg) {
            svg.style.width = '100%';
            svg.style.height = 'auto';
            svg.style.maxHeight = 'calc(100vh - 200px)';
        }
    });
}

// Función para cargar partituras guardadas
function loadSavedScores() {
    try {
        const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
        const container = document.getElementById('scores-container');
        const emptyState = document.getElementById('empty-state');
        
        if (savedScores.length === 0) {
            emptyState.style.display = 'flex';
            container.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        container.style.display = 'flex';
        container.innerHTML = '';
        
        savedScores.forEach((score, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            
            const card = document.createElement('div');
            card.className = 'card score-card h-100';
            card.onclick = () => openScoreForEditing(score);
            
            let clefIcon;
            if (score.clef === 'treble') clefIcon = '<i class="fas fa-music clef-icon" title="Clave de Sol"></i>';
            else if (score.clef === 'bass') clefIcon = '<i class="fas fa-music clef-icon" style="transform: rotate(180deg);" title="Clave de Fa"></i>';
            else clefIcon = '<i class="fas fa-italic clef-icon" title="Clave de Do"></i>';
            
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${score.name || 'Partitura sin nombre'}</h5>
                    <div class="card-text">
                        <div class="d-flex flex-wrap gap-2 mb-2">
                            <span class="badge bg-primary">${clefIcon} ${getClefName(score.clef)}</span>
                            <span class="badge bg-secondary">${score.timeSignature}</span>
                            <span class="badge bg-info text-dark">${score.keySignature}</span>
                            <span class="badge bg-warning text-dark">${score.tempo || 'N/A'} BPM</span>
                        </div>
                        <small class="text-muted">Creada: ${new Date(score.timestamp).toLocaleString()}</small>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary download-pdf" data-index="${index}">
                        <i class="fas fa-file-pdf me-1"></i> Descargar
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-score" data-index="${index}">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            `;
            
            col.appendChild(card);
            container.appendChild(col);
        });
        
        document.querySelectorAll('.delete-score').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                deleteScore(index);
            });
        });
        
        document.querySelectorAll('.download-pdf').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
                downloadPdf(savedScores[index]);
            });
        });
        
    } catch (error) {
        console.error('Error al cargar partituras:', error);
        document.getElementById('empty-state').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar partituras: ${error.message}
            </div>
        `;
    }
}

// Función para abrir partitura en el editor
function openScoreForEditing(score) {
    try {
        // Guardar la partitura en localStorage para que partitura.html la cargue
        localStorage.setItem('currentScoreToLoad', JSON.stringify(score));
        // Redirigir a partitura.html
        window.location.href = 'partitura.html';
    } catch (error) {
        console.error('Error al abrir partitura para edición:', error);
        showMessage('Error al abrir la partitura para edición', 'danger');
    }
}

function getClefName(clef) {
    switch(clef) {
        case 'treble': return 'Clave de Sol';
        case 'bass': return 'Clave de Fa';
        case 'alto': return 'Clave de Do';
        default: return clef;
    }
}

function deleteScore(index) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta partitura?')) return;
    
    const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
    savedScores.splice(index, 1);
    localStorage.setItem('savedScores', JSON.stringify(savedScores));
    
    loadSavedScores();
    showMessage('Partitura eliminada correctamente', 'success');
}

function showMessage(text, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    messageEl.style.zIndex = '1000';
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${text}
    `;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

function showScoreModal(score) {
    currentScore = score;
    const modal = new bootstrap.Modal(document.getElementById('scoreModal'));
    document.getElementById('scoreModalTitle').textContent = score.name || 'Partitura';
    
    const container = document.getElementById('modal-score-content');
    container.innerHTML = '<div id="vexflow-render-container" style="width:100%; min-height:300px;"></div>';
    
    try {
        if (typeof Vex === 'undefined' || typeof Vex.Flow === 'undefined') {
            throw new Error('La biblioteca VexFlow no está cargada correctamente');
        }
        
        const width = container.clientWidth - 40;
        const height = Math.min(600, window.innerHeight * 0.7);
        
        const renderer = new Vex.Flow.Renderer(
            document.getElementById('vexflow-render-container'),
            Vex.Flow.Renderer.Backends.SVG
        );
        
        renderer.resize(width, height);
        const context = renderer.getContext();
        context.setFont('Arial', 10);
        
        const system = new Vex.Flow.System({
            x: 0,
            y: 0,
            width: width,
            spaceBetweenStaves: 10
        });
        
        const vexNotes = score.notes.map(note => {
            return new Vex.Flow.StaveNote({
                keys: note.keys,
                duration: note.duration,
                clef: note.clef || score.clef,
                auto_stem: true
            });
        });
        
        const stave = system.addStave({
            voices: [
                new Vex.Flow.Voice({
                    num_beats: score.timeSignature.split('/')[0],
                    beat_value: score.timeSignature.split('/')[1],
                    resolution: Vex.Flow.RESOLUTION
                }).addTickables(vexNotes)
            ]
        });
        
        stave.addClef(score.clef)
             .addTimeSignature(score.timeSignature)
             .addKeySignature(score.keySignature);
        
        system.format();
        system.draw(context);
        
        document.getElementById('downloadPdfBtn').onclick = () => downloadPdf(score);
        document.getElementById('fullscreenBtn').onclick = showFullscreenPreview;
        
    } catch (error) {
        console.error('Error al renderizar partitura:', error);
        container.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <div>
                    <h5>Error al cargar la partitura</h5>
                    <p class="mb-0">${error.message}</p>
                </div>
            </div>
        `;
    }
    
    modal.show();
}

function downloadPdf(score) {
    showMessage('Generando PDF...', 'info');
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.height = '600px';
    document.body.appendChild(tempContainer);
    
    try {
        if (typeof Vex === 'undefined' || typeof Vex.Flow === 'undefined') {
            throw new Error('VexFlow no está disponible');
        }
        
        const renderer = new Vex.Flow.Renderer(
            tempContainer,
            Vex.Flow.Renderer.Backends.SVG
        );
        
        renderer.resize(800, 600);
        const context = renderer.getContext();
        context.setFont('Arial', 12);
        
        const system = new Vex.Flow.System({
            x: 10,
            y: 20,
            width: 780,
            spaceBetweenStaves: 30
        });
        
        const vexNotes = score.notes.map(note => {
            return new Vex.Flow.StaveNote({
                keys: note.keys,
                duration: note.duration,
                clef: note.clef || score.clef,
                auto_stem: true
            });
        });
        
        const stave = system.addStave({
            voices: [
                new Vex.Flow.Voice({
                    num_beats: score.timeSignature.split('/')[0],
                    beat_value: score.timeSignature.split('/')[1],
                    resolution: Vex.Flow.RESOLUTION
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
            if (!svgElement) {
                throw new Error('No se pudo generar la partitura');
            }
            
            const serializer = new XMLSerializer();
            let svgStr = serializer.serializeToString(svgElement);
            
            const img = new Image();
            const svgBlob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const widthInPoints = 8.5 * 72;
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
                
                pdf.save(`${score.name || 'partitura'}.pdf`);
                
                URL.revokeObjectURL(url);
                document.body.removeChild(tempContainer);
                showMessage('PDF generado con éxito', 'success');
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
        showMessage('Error al generar PDF: ' + error.message, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Vex === 'undefined') {
        console.error('VexFlow no está cargado');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/vexflow@3.0.9/releases/vexflow-min.js';
        script.onload = loadSavedScores;
        script.onerror = () => {
            showMessage('Error al cargar la biblioteca de partituras', 'danger');
        };
        document.head.appendChild(script);
    } else {
        loadSavedScores();
    }
    
    if (typeof setupDarkMode === 'function') {
        setupDarkMode();
    }
});