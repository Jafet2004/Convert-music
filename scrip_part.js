// Detectar orientación en móviles
function checkOrientation() {
    if (window.innerWidth < 768) { // Solo para móviles
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        if (isPortrait) {
            document.getElementById('orientation-message').style.display = 'flex';
            return false;
        } else {
            document.getElementById('orientation-message').style.display = 'none';
            return true;
        }
    }
    return true;
}

// Verificar orientación al cargar y al cambiar tamaño
window.addEventListener('load', function() {
    checkOrientation();
    
    // Deshabilitar botones si está en vertical en móvil
    if (!checkOrientation()) {
        document.getElementById('drawScore').disabled = true;
        document.getElementById('previewScore').disabled = true;
    }
});

window.addEventListener('resize', function() {
    const wasPortrait = document.getElementById('orientation-message').style.display === 'flex';
    const nowValid = checkOrientation();
    
    if (wasPortrait && nowValid) {
        // Se giró a horizontal, habilitar funciones
        document.getElementById('drawScore').disabled = false;
        document.getElementById('previewScore').disabled = false;
    } else if (!wasPortrait && !nowValid) {
        // Se giró a vertical, deshabilitar funciones
        document.getElementById('drawScore').disabled = true;
        document.getElementById('previewScore').disabled = true;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const VF = Vex.Flow;
    const notes = [];
    let scoreName = "Partitura sin nombre";
    
    // Elementos del DOM
    const nameInput = document.getElementById('name');
    const noteSelect = document.getElementById('note');
    const durationSelect = document.getElementById('duration');
    const clefSelect = document.getElementById('clef');
    const timeSignatureSelect = document.getElementById('timeSignature');
    const keySignatureSelect = document.getElementById('keySignature');
    const addNoteBtn = document.getElementById('addNote');
    const clearNoteBtn = document.getElementById('clearNote');
    const clearAllBtn = document.getElementById('clearAll');
    const drawScoreBtn = document.getElementById('drawScore');
    const previewScoreBtn = document.getElementById('previewScore');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadFromModalBtn = document.getElementById('downloadFromModal');
    const noteListDiv = document.getElementById('noteList');
    const scoreContentDiv = document.getElementById('score-content');
    const fullscreenScoreDiv = document.getElementById('fullscreen-score');
    const messageDiv = document.getElementById('message');
    const noteCountSpan = document.getElementById('noteCount');
    const fullscreenModal = new bootstrap.Modal(document.getElementById('fullscreenModal'));
    
    // Mapeo de armaduras a alteraciones (completo y consistente)
    const keySignatures = {
        'C': { key: 'C', acc: null, type: '#' },
        'G': { key: 'G', acc: 'f#', type: '#' },
        'D': { key: 'D', acc: 'f#c#', type: '#' },
        'A': { key: 'A', acc: 'f#c#g#', type: '#' },
        'E': { key: 'E', acc: 'f#c#g#d#', type: '#' },
        'B': { key: 'B', acc: 'f#c#g#d#a#', type: '#' },
        'F#': { key: 'F#', acc: 'f#c#g#d#a#e#', type: '#' },
        'C#': { key: 'C#', acc: 'f#c#g#d#a#e#b#', type: '#' },
        'F': { key: 'F', acc: 'b', type: 'b' },
        'Bb': { key: 'Bb', acc: 'bbeb', type: 'b' },
        'Eb': { key: 'Eb', acc: 'bbebab', type: 'b' },
        'Ab': { key: 'Ab', acc: 'bbebabdb', type: 'b' },
        'Db': { key: 'Db', acc: 'bbebabdbgb', type: 'b' },
        'Gb': { key: 'Gb', acc: 'bbebabdbgbcb', type: 'b' },
        'Cb': { key: 'Cb', acc: 'bbebabdbgbcbfb', type: 'b' }
    };
    
    // Función para mostrar mensajes
    function showMessage(text, type = 'info') {
        messageDiv.innerHTML = `<i class="fas fa-${type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${text}`;
        messageDiv.className = `alert alert-${type} d-flex align-items-center`;
        
        if (type !== 'info') {
            setTimeout(() => {
                showMessage('Selecciona tus notas y haz clic en "Ver Partitura"', 'info');
            }, 3000);
        }
    }
    
    // Función para limpiar completamente
    function clearAll() {
        if (notes.length === 0) {
            showMessage('No hay notas para limpiar', 'info');
            return;
        }
        
        notes.length = 0;
        updateNoteList();
        clearScorePreview();
        showMessage('Todas las notas han sido eliminadas', 'success');
    }

    // Función para limpiar la vista previa
    function clearScorePreview() {
        scoreContentDiv.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 text-muted">
                <div class="text-center">
                    <i class="fas fa-music fa-3x mb-3"></i>
                    <p>Agrega notas y haz clic en "Ver Partitura"</p>
                </div>
            </div>
        `;
        downloadPdfBtn.disabled = true;
    }

    // Actualizar lista de notas
    function updateNoteList() {
        if (notes.length === 0) {
            noteListDiv.textContent = 'No hay elementos agregados aún';
            noteListDiv.className = 'p-3 bg-light border rounded empty';
            noteCountSpan.textContent = '0';
            downloadPdfBtn.disabled = true;
            clearScorePreview();
            return;
        }
        
        noteListDiv.innerHTML = notes.map((note, index) => {
            if (note.duration.endsWith('r')) {
                const durationSymbol = getDurationSymbol(note.duration);
                return `<div class="py-1 d-flex justify-content-between align-items-center">
                    <span>${index + 1}. ${durationSymbol}</span>
                    <button class="btn btn-sm btn-outline-danger remove-note" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
            } else {
                const noteName = getNoteName(note.key);
                const durationSymbol = getDurationSymbol(note.duration);
                return `<div class="py-1 d-flex justify-content-between align-items-center">
                    <span>${index + 1}. ${noteName} ${durationSymbol}</span>
                    <button class="btn btn-sm btn-outline-danger remove-note" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
            }
        }).join('');
        
        noteListDiv.className = 'p-3 bg-light border rounded';
        noteCountSpan.textContent = notes.length;
        downloadPdfBtn.disabled = false;
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.remove-note').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                notes.splice(index, 1);
                updateNoteList();
                showMessage('Nota eliminada', 'success');
            });
        });
    }
    
    // Obtener nombre de la nota
    function getNoteName(noteValue) {
        const noteMap = {
            'c/4': 'Do', 'd/4': 'Re', 'e/4': 'Mi', 'f/4': 'Fa',
            'g/4': 'Sol', 'a/4': 'La', 'b/4': 'Si', 'c/5': 'Do (8va)'
        };
        return noteMap[noteValue] || noteValue;
    }
    
    // Obtener símbolo de duración
    function getDurationSymbol(duration) {
        const durationMap = {
            'q': 'Negra (♪)', '8': 'Corchea (♫)', '16': 'Semicorchea (♬)',
            'h': 'Blanca (𝅗)', 'w': 'Redonda (𝅝)', 'qr': 'Silencio de negra (𝄽)',
            '8r': 'Silencio de corchea (𝄾)', '16r': 'Silencio de semicorchea (𝄿)',
            'hr': 'Silencio de blanca (𝄻)', 'wr': 'Silencio de redonda (𝄺)'
        };
        return durationMap[duration] || duration;
    }
    
    // Validar selección antes de agregar nota
    function validateSelection() {
        if (!durationSelect.value) {
            showMessage('Debes seleccionar una duración', 'danger');
            return false;
        }
        
        if (!durationSelect.value.endsWith('r') && noteSelect.value === 'seleccione') {
            showMessage('Para notas musicales debes seleccionar una nota', 'danger');
            return false;
        }
        
        return true;
    }
    
    // Agregar nota o silencio
    addNoteBtn.addEventListener('click', function() {
        if (!validateSelection()) return;
        
        const selectedNote = noteSelect.value;
        const duration = durationSelect.value;
        
        if (duration.endsWith('r')) {
            const durationName = getDurationSymbol(duration);
            notes.push({
                key: '',
                duration: duration,
                name: durationName
            });
            showMessage(`${durationName} agregado`, 'success');
        } else {
            const noteName = getNoteName(selectedNote);
            const durationName = getDurationSymbol(duration);
            notes.push({
                key: selectedNote,
                duration: duration,
                name: noteName
            });
            showMessage(`Nota ${noteName} (${durationName}) agregada`, 'success');
        }
        
        // Resetear selecciones
        noteSelect.value = 'seleccione';
        durationSelect.value = '';
        
        updateNoteList();
        clearScorePreview();
    });
    
    // Eliminar última nota
    clearNoteBtn.addEventListener('click', function() {
        if (notes.length === 0) {
            showMessage('No hay notas para eliminar', 'info');
            return;
        }
        
        const removedNote = notes.pop();
        showMessage(`Nota "${removedNote.name}" eliminada`, 'success');
        updateNoteList();
    });

    // Limpiar todas las notas
    clearAllBtn.addEventListener('click', clearAll);
    
    // Dibujar partitura (versión mejorada)
    function drawScore(container, isFullscreen = false) {
        try {
            if (window.innerWidth < 768 && !checkOrientation()) {
                showMessage('Gira tu dispositivo a horizontal para ver la partitura', 'warning');
                return false;
            }
            
            container.innerHTML = '';
            
            const clef = clefSelect.value || "treble";
            const timeSignature = timeSignatureSelect.value || "4/4";
            const keySignature = keySignatureSelect.value || "C";
            const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);
            const keyConfig = keySignatures[keySignature];
            
            let totalBeats = 0;
            notes.forEach(note => {
                const dur = note.duration.replace('r', '');
                let noteBeats = 
                    dur === 'w' ? 4 :
                    dur === 'h' ? 2 :
                    dur === 'q' ? 1 :
                    dur === '8' ? 0.5 :
                    dur === '16' ? 0.25 : 1;
                totalBeats += noteBeats;
            });

            const measures = Math.ceil(totalBeats / beatsPerMeasure);
            const totalBeatsNeeded = measures * beatsPerMeasure;
            
            const staveNotes = notes.map(note => {
                if (note.duration.endsWith('r')) {
                    return new VF.GhostNote({
                        duration: note.duration.replace('r', ''),
                        align_center: true
                    });
                }
                
                const staveNote = new VF.StaveNote({
                    keys: [note.key],
                    duration: note.duration,
                    clef: clef,
                    auto_stem: true
                });
                
                // Aplicar alteraciones según la armadura
                if (keyConfig.acc && !note.duration.endsWith('r')) {
                    const notePitch = note.key.split('/')[0];
                    if (keyConfig.acc.includes(notePitch)) {
                        staveNote.addAccidental(0, new VF.Accidental(keyConfig.type === '#' ? '#' : 'b'));
                    }
                }
                
                return staveNote;
            });

            if (totalBeats < totalBeatsNeeded) {
                const remainingBeats = totalBeatsNeeded - totalBeats;
                let compensationDuration;
                
                if (remainingBeats >= 4) compensationDuration = 'wr';
                else if (remainingBeats >= 2) compensationDuration = 'hr';
                else if (remainingBeats >= 1) compensationDuration = 'qr';
                else if (remainingBeats >= 0.5) compensationDuration = '8r';
                else compensationDuration = '16r';
                
                staveNotes.push(new VF.GhostNote({
                    duration: compensationDuration.replace('r', ''),
                    align_center: true
                }));
            }

            const measuresNotes = [];
            let currentMeasureNotes = [];
            let currentBeats = 0;
            
            staveNotes.forEach(note => {
                const dur = note.duration.replace('r', '');
                let noteBeats = 
                    dur === 'w' ? 4 :
                    dur === 'h' ? 2 :
                    dur === 'q' ? 1 :
                    dur === '8' ? 0.5 :
                    dur === '16' ? 0.25 : 1;
                
                if (currentBeats + noteBeats > beatsPerMeasure) {
                    const remainingBeats = beatsPerMeasure - currentBeats;
                    if (remainingBeats > 0) {
                        let restDuration;
                        if (remainingBeats >= 1) restDuration = 'qr';
                        else if (remainingBeats >= 0.5) restDuration = '8r';
                        else restDuration = '16r';
                        
                        currentMeasureNotes.push(new VF.GhostNote({
                            duration: restDuration.replace('r', ''),
                            align_center: true
                        }));
                        currentBeats += remainingBeats;
                    }
                    
                    measuresNotes.push(currentMeasureNotes);
                    currentMeasureNotes = [];
                    currentBeats = 0;
                }
                
                currentMeasureNotes.push(note);
                currentBeats += noteBeats;
                
                if (currentBeats >= beatsPerMeasure) {
                    measuresNotes.push(currentMeasureNotes);
                    currentMeasureNotes = [];
                    currentBeats = 0;
                }
            });
            
            if (currentMeasureNotes.length > 0) {
                measuresNotes.push(currentMeasureNotes);
            }

            // Configuración responsiva
            const staveHeight = 120;
            const stavePadding = 30;
            const measuresPerLine = isFullscreen ? 
                Math.min(measures, 6) : 
                Math.min(measures, window.innerWidth < 768 ? 2 : 3);
            const totalLines = Math.ceil(measuresNotes.length / measuresPerLine);
            
            const containerWidth = container.offsetWidth - 40;
            const staveWidth = isFullscreen ? 
                Math.min(measuresPerLine * 200, window.innerWidth - 100) : 
                Math.min(measuresPerLine * 180, containerWidth);
            
            container.style.height = `${totalLines * (staveHeight + stavePadding)}px`;
            
            const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
            renderer.resize(staveWidth, totalLines * (staveHeight + stavePadding));
            const context = renderer.getContext();
            context.scale(0.9, 0.9);
            
            for (let line = 0; line < totalLines; line++) {
                const startMeasure = line * measuresPerLine;
                const endMeasure = Math.min((line + 1) * measuresPerLine, measuresNotes.length);
                const lineMeasures = endMeasure - startMeasure;
                const measureWidth = staveWidth / lineMeasures;
                
                let currentX = 20;
                const currentY = 40 + line * (staveHeight + stavePadding);
                
                let startX = 80;
                if (clef === "bass") startX = 90;
                else if (clef === "alto") startX = 85;

                let stave = new VF.Stave(currentX, currentY, measureWidth);
                
                if (line === 0) {
                    stave.addClef(clef);
                    
                    if (keySignature !== 'C') {
                        stave.addKeySignature(keyConfig.key);
                    }
                    
                    stave.addTimeSignature(timeSignature);
                } else {
                    stave.addClef(clef);
                }
                
                stave.setNoteStartX(startX);
                stave.setContext(context).draw();
                currentX += measureWidth;
                
                for (let i = 1; i < lineMeasures; i++) {
                    stave = new VF.Stave(currentX, currentY, measureWidth);
                    
                    if (i < lineMeasures) {
                        stave.setEndBarType(VF.Barline.type.SINGLE);
                    }
                    
                    stave.setContext(context).draw();
                    currentX += measureWidth;
                }

                currentX = 20;
                for (let i = 0; i < lineMeasures; i++) {
                    const measureIndex = startMeasure + i;
                    if (measureIndex >= measuresNotes.length) break;
                    
                    const measureNotes = measuresNotes[measureIndex];
                    
                    const voice = new VF.Voice({
                        num_beats: beatsPerMeasure,
                        beat_value: beatValue,
                        resolution: Vex.Flow.RESOLUTION
                    });
                    
                    voice.addTickables(measureNotes);
                    
                    new VF.Formatter()
                        .joinVoices([voice])
                        .format([voice], measureWidth - 50);
                    
                    const tempStave = new VF.Stave(currentX, currentY, measureWidth);
                    tempStave.setContext(context);
                    
                    if (line === 0 && i === 0) {
                        tempStave.setNoteStartX(startX);
                    }
                    
                    voice.draw(context, tempStave);
                    
                    currentX += measureWidth;
                }
            }

            return true;
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al generar la partitura: ' + error.message, 'danger');
            return false;
        }
    }
    
    // Mostrar partitura en vista previa
    drawScoreBtn.addEventListener('click', function() {
        scoreName = nameInput.value.trim() || "Partitura sin nombre";
        
        if (notes.length === 0) {
            showMessage('Debes agregar al menos una nota o silencio', 'danger');
            return;
        }
        
        if (drawScore(scoreContentDiv)) {
            showMessage('Partitura generada correctamente', 'success');
        }
    });

    // Mostrar partitura en pantalla completa
    previewScoreBtn.addEventListener('click', function() {
        scoreName = nameInput.value.trim() || "Partitura sin nombre";
        
        if (notes.length === 0) {
            showMessage('Debes agregar al menos una nota o silencio', 'danger');
            return;
        }
        
        document.getElementById('fullscreenModalTitle').textContent = scoreName;
        
        if (drawScore(fullscreenScoreDiv, true)) {
            fullscreenModal.show();
            showMessage('Partitura mostrada en pantalla completa', 'success');
        }
    });
    
    // Descargar PDF
    async function downloadPdf(container) {
        if (window.innerWidth < 768 && !checkOrientation()) {
            showMessage('Gira tu dispositivo a horizontal para generar el PDF', 'warning');
            return;
        }
        
        if (!container.hasChildNodes() || container.querySelector('svg') === null) {
            showMessage('Primero debes generar la partitura', 'danger');
            return;
        }
        
        try {
            showMessage('Generando PDF...', 'info');
            
            // Crear un contenedor temporal para el SVG
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = container.offsetWidth + 'px';
            tempDiv.style.height = container.offsetHeight + 'px';
            document.body.appendChild(tempDiv);
            
            // Clonar el SVG al contenedor temporal
            const svgClone = container.querySelector('svg').cloneNode(true);
            tempDiv.appendChild(svgClone);
            
            // Usar html2canvas para renderizar
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                removeContainer: true
            });
            
            document.body.removeChild(tempDiv);
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm'
            });
            
            // Ajustar tamaño del PDF al contenido
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.setFontSize(16);
            pdf.text(scoreName, pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
            
            pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
            pdf.save(`${scoreName}.pdf`);
            
            showMessage('PDF descargado correctamente', 'success');
        } catch (error) {
            console.error(error);
            showMessage('Error al generar PDF: ' + error.message, 'danger');
        }
    }
    
    // Evento para el botón de descarga desde el modal
    downloadFromModalBtn.addEventListener('click', function() {
        downloadPdf(fullscreenScoreDiv);
    });
    
    // Descargar PDF desde vista previa
    downloadPdfBtn.addEventListener('click', function() {
        downloadPdf(scoreContentDiv);
    });
    
    // Inicialización
    updateNoteList();
    showMessage('Selecciona notas/silencios y haz clic en "Ver Partitura"', 'info');
});