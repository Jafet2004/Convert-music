document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const VF = Vex.Flow;
    let notes = [];
    let scoreName = "Mi melodía";

    // Elementos del DOM
    const nameInput = document.getElementById('name');
    const clefSelect = document.getElementById('clef');
    const timeSignatureSelect = document.getElementById('timeSignature');
    const keySignatureSelect = document.getElementById('keySignature');
    const tempoInput = document.getElementById('tempo');
    const noteSelect = document.getElementById('note');
    const durationSelect = document.getElementById('duration');
    const addNoteBtn = document.getElementById('addNote');
    const clearNoteBtn = document.getElementById('clearNote');
    const clearAllBtn = document.getElementById('clearAll');
    const drawScoreBtn = document.getElementById('drawScore');
    const previewScoreBtn = document.getElementById('previewScore');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadFromModalBtn = document.getElementById('downloadFromModal');
    const noteList = document.getElementById('noteList');
    const noteCount = document.getElementById('noteCount');
    const scoreContent = document.getElementById('score-content');
    const fullscreenScore = document.getElementById('fullscreen-score');
    const messageDiv = document.getElementById('message');
    const fullscreenModal = new bootstrap.Modal(document.getElementById('fullscreenModal'));

    // Mapeo de armaduras
    const keySignatures = {
        'C': { key: 'C' }, 'G': { key: 'G' }, 'D': { key: 'D' }, 'A': { key: 'A' },
        'E': { key: 'E' }, 'B': { key: 'B' }, 'F#': { key: 'F#' }, 'C#': { key: 'C#' },
        'F': { key: 'F' }, 'Bb': { key: 'Bb' }, 'Eb': { key: 'Eb' }, 'Ab': { key: 'Ab' },
        'Db': { key: 'Db' }, 'Gb': { key: 'Gb' }, 'Cb': { key: 'Cb' }
    };

    // Inicialización
    init();

    function init() {
        // Configurar event listeners
        nameInput.addEventListener('change', updateScoreName);
        clefSelect.addEventListener('change', () => updateNoteOptions(clefSelect.value));
        addNoteBtn.addEventListener('click', addNote);
        clearNoteBtn.addEventListener('click', clearLastNote);
        clearAllBtn.addEventListener('click', clearAllNotes);
        drawScoreBtn.addEventListener('click', drawScoreHandler);
        previewScoreBtn.addEventListener('click', showFullscreenPreview);
        downloadPdfBtn.addEventListener('click', () => downloadScore(scoreContent));
        downloadFromModalBtn.addEventListener('click', () => downloadScore(fullscreenScore));

        // Configuración inicial
        updateScoreName();
        updateNoteOptions(clefSelect.value);
        updateNoteList();
        showMessage('Selecciona notas/silencios y haz clic en "Ver Partitura"', 'info');
    }

    function updateNoteOptions(clef) {
        noteSelect.innerHTML = '<option value="seleccione" selected>Seleccione una nota</option>';
        const notesForClef = {
            'treble': [
                { value: 'c/4', name: 'Do4' }, { value: 'd/4', name: 'Re4' }, { value: 'e/4', name: 'Mi4' }, { value: 'f/4', name: 'Fa4' },
                { value: 'g/4', name: 'Sol4' }, { value: 'a/4', name: 'La4' }, { value: 'b/4', name: 'Si4' },
                { value: 'c/5', name: 'Do5' }, { value: 'd/5', name: 'Re5' }, { value: 'e/5', name: 'Mi5' }
            ], 'bass': [
                { value: 'c/2', name: 'Do2' }, { value: 'd/2', name: 'Re2' }, { value: 'e/2', name: 'Mi2' }, { value: 'f/2', name: 'Fa2' },
                { value: 'g/2', name: 'Sol2' }, { value: 'a/2', name: 'La2' }, { value: 'b/2', name: 'Si2' },
                { value: 'c/3', name: 'Do3' }, { value: 'd/3', name: 'Re3' }, { value: 'e/3', name: 'Mi3' }
            ], 'alto': [
                { value: 'f/3', name: 'Fa3' }, { value: 'g/3', name: 'Sol3' }, { value: 'a/3', name: 'La3' }, { value: 'b/3', name: 'Si3' },
                { value: 'c/4', name: 'Do4 (central)' }, { value: 'd/4', name: 'Re4' }, { value: 'e/4', name: 'Mi4' },
                { value: 'f/4', name: 'Fa4' }, { value: 'g/4', name: 'Sol4' }, { value: 'a/4', name: 'La4' }
            ]
        };
        notesForClef[clef].forEach(note => {
            const option = document.createElement('option');
            option.value = note.value;
            option.textContent = note.name;
            noteSelect.appendChild(option);
        });
    }

    function updateScoreName() {
        scoreName = nameInput.value.trim() || "Mi melodía";
    }

    function showMessage(text, type = 'info') {
        const icons = { 'info': 'info-circle', 'success': 'check-circle', 'warning': 'exclamation-circle', 'danger': 'exclamation-triangle' };
        messageDiv.innerHTML = `<i class="fas fa-${icons[type]} me-2"></i>${text}`;
        messageDiv.className = `alert alert-${type} d-flex align-items-center`;
        if (type !== 'info') {
            setTimeout(() => showMessage('Listo para agregar más elementos a tu partitura.', 'info'), 3000);
        }
    }

    function addNote() {
        const noteValue = noteSelect.value;
        const durationValue = durationSelect.value;
        if (!durationValue) {
            showMessage("Debes seleccionar una duración", "danger");
            return;
        }
        if (!durationValue.endsWith('r') && noteValue === "seleccione") {
            showMessage("Para notas musicales debes seleccionar una nota", "danger");
            return;
        }
        notes.push({ key: noteValue, duration: durationValue });
        updateNoteList();
        enableButtons();
        noteSelect.value = 'seleccione';
        durationSelect.value = '';
        showMessage(`Elemento agregado: ${getNoteDescription(notes[notes.length-1])}`, "success");
    }

    function getNoteDescription(note) {
        if (note.duration.endsWith('r')) return getDurationSymbol(note.duration);
        const noteName = getNoteName(note.key);
        const durationName = getDurationSymbol(note.duration);
        return `${noteName} (${durationName})`;
    }

    function getNoteName(noteValue) {
        const allOptions = document.querySelectorAll('#note option');
        const option = Array.from(allOptions).find(opt => opt.value === noteValue);
        return option ? option.textContent : noteValue;
    }

    function getDurationSymbol(duration) {
        const option = Array.from(durationSelect.options).find(opt => opt.value === duration);
        return option ? option.textContent : duration;
    }

    function clearLastNote() {
        if (notes.length > 0) {
            const removedNote = notes.pop();
            updateNoteList();
            if (notes.length === 0) disableButtons();
            showMessage(`Elemento eliminado: ${getNoteDescription(removedNote)}`, "success");
        } else {
            showMessage("No hay notas para eliminar", "warning");
        }
    }

    function clearAllNotes() {
        if (notes.length > 0) {
            notes = [];
            updateNoteList();
            disableButtons();
            clearScorePreview();
            showMessage("Todas las notas han sido eliminadas", "success");
        } else {
            showMessage("No hay notas para eliminar", "warning");
        }
    }

    function updateNoteList() {
        noteCount.textContent = notes.length;
        if (notes.length === 0) {
            noteList.innerHTML = "No hay elementos agregados aún";
            noteList.className = 'p-3 bg-light border rounded empty';
            return;
        }
        let html = '<div class="list-group">';
        notes.forEach((note, index) => {
            html += `<div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <span>${index + 1}. ${getNoteDescription(note)}</span>
                <button class="btn btn-sm btn-outline-danger remove-note" data-index="${index}"><i class="fas fa-times"></i></button>
            </div>`;
        });
        html += '</div>';
        noteList.innerHTML = html;
        noteList.className = 'p-3 bg-light border rounded';
        document.querySelectorAll('.remove-note').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const removedNote = notes.splice(index, 1)[0];
                updateNoteList();
                showMessage(`Elemento eliminado: ${getNoteDescription(removedNote)}`, "success");
                if (notes.length === 0) disableButtons();
            });
        });
    }

    function enableButtons() {
        drawScoreBtn.disabled = false;
        previewScoreBtn.disabled = false;
        downloadPdfBtn.disabled = false;
    }

    function disableButtons() {
        drawScoreBtn.disabled = true;
        previewScoreBtn.disabled = true;
        downloadPdfBtn.disabled = true;
    }

    function clearScorePreview() {
        scoreContent.innerHTML = `<div class="d-flex justify-content-center align-items-center h-100 text-muted"><div class="text-center">
            <i class="fas fa-music fa-3x mb-3"></i><p>Agrega notas y haz clic en "Ver Partitura"</p>
        </div></div>`;
    }

    function drawScoreHandler() {
        if (notes.length === 0) {
            showMessage('Debes agregar al menos una nota o silencio', 'danger');
            return;
        }
        if (drawScore(scoreContent)) {
            showMessage('Partitura generada correctamente', 'success');
        }
    }

    function createVexFlowNote(noteData) {
        const clef = clefSelect.value;
        let keys;
        // La posición vertical de los silencios depende de la clave
        if (noteData.duration.endsWith('r')) {
            keys = [clef === 'bass' ? 'd/3' : 'b/4'];
        } else {
            keys = [noteData.key];
        }
        return new VF.StaveNote({ keys: keys, duration: noteData.duration, clef: clef, auto_stem: true });
    }

    function getDurationFromTicks(ticks) {
        // VexFlow RESOLUTION es 960 por negra (quarter note)
        const quarterTicks = VF.RESOLUTION / 4;
        
        if (ticks === quarterTicks) return 'qr';
        if (ticks === quarterTicks / 2) return '8r';
        if (ticks === quarterTicks / 4) return '16r';
        if (ticks === quarterTicks * 2) return 'hr';
        if (ticks === quarterTicks * 4) return 'wr';
        
        // Para valores no estándar, intentamos aproximar
        if (ticks > quarterTicks * 2) return 'wr'; // Redondear a redonda
        if (ticks > quarterTicks) return 'hr';     // Redondear a blanca
        if (ticks > quarterTicks / 2) return 'qr'; // Redondear a negra
        return '16r'; // Por defecto usar semicorchea
    }

    function drawScore(container, isFullscreen = false) {
        try {
            container.innerHTML = '';
            const clef = clefSelect.value;
            const timeSignature = timeSignatureSelect.value;
            const key = keySignatureSelect.value;
            const tempo = tempoInput.value || 120;

            const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);
            const ticksPerMeasure = (4 / beatValue) * beatsPerMeasure * VF.RESOLUTION / 4;

            // 1. Convertir nuestras notas a notas de VexFlow
            const vexNotes = notes.map(createVexFlowNote);

            // 2. Dividir las notas en compases
            const measures = [];
            let currentMeasure = [];
            let currentTicks = 0;
            
            vexNotes.forEach(note => {
                const noteTicks = note.getTicks().value();
                
                // Si agregar esta nota excede el compás
                if (currentTicks + noteTicks > ticksPerMeasure) {
                    // Calcular cuánto falta para completar el compás
                    const remainingTicks = ticksPerMeasure - currentTicks;
                    
                    // Si hay espacio restante, agregar un silencio
                    if (remainingTicks > 0) {
                        try {
                            const restDuration = getDurationFromTicks(remainingTicks);
                            currentMeasure.push(new VF.GhostNote({ duration: restDuration }));
                            currentTicks += remainingTicks;
                        } catch (e) {
                            console.warn("No se pudo crear silencio para", remainingTicks, "ticks");
                        }
                    }
                    
                    // Guardar el compás completo y comenzar uno nuevo
                    measures.push(currentMeasure);
                    currentMeasure = [note];
                    currentTicks = noteTicks;
                } else {
                    currentMeasure.push(note);
                    currentTicks += noteTicks;
                }
            });

            // Añadir el último compás aunque esté incompleto
            if (currentMeasure.length > 0) {
                const remainingTicks = ticksPerMeasure - currentTicks;
                
                // Si el compás está incompleto, agregar silencio final
                if (remainingTicks > 0) {
                    try {
                        const restDuration = getDurationFromTicks(remainingTicks);
                        currentMeasure.push(new VF.GhostNote({ duration: restDuration }));
                    } catch (e) {
                        console.warn("No se pudo crear silencio final para", remainingTicks, "ticks");
                    }
                }
                
                measures.push(currentMeasure);
            }

            // 3. Configurar renderizado y dimensiones
            const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
            const containerWidth = container.clientWidth;
            renderer.resize(containerWidth, 500); // Altura inicial, se ajustará
            const context = renderer.getContext();

            const staveWidth = isFullscreen ? (containerWidth / 4) : (containerWidth / 3);
            const headerWidth = 120;
            const noteStaveWidth = staveWidth - 20;

            let currentX = 0;
            let currentY = 40;
            let stavesDrawnOnLine = 0;
            let totalHeight = 0;

            // 4. Dibujar pentagramas y notas, línea por línea
            for (let i = 0; i < measures.length; i++) {
                const isFirstMeasureOfLine = stavesDrawnOnLine === 0;
                let stave;

                if (isFirstMeasureOfLine) {
                    currentX = 0;
                    if (i > 0) currentY += 120; // Bajar para la nueva línea
                    stave = new VF.Stave(currentX, currentY, headerWidth);
                    stave.addClef(clef);
                    if (i === 0) { // Solo en el primer compás de toda la pieza
                        stave.addKeySignature(key);
                        stave.addTimeSignature(timeSignature);
                        stave.setTempo({ duration: 'q', bpm: tempo }, -10);
                    }
                    stave.setContext(context).draw();
                    currentX += headerWidth;
                }

                stave = new VF.Stave(currentX, currentY, noteStaveWidth);
                stave.setContext(context).draw();

                // Formatear y dibujar las notas para este compás
                const measureNotes = measures[i];
                VF.Beam.generateBeams(measureNotes.filter(n => !(n instanceof VF.GhostNote)));
                VF.Formatter.FormatAndDraw(context, stave, measureNotes);

                currentX += noteStaveWidth;
                stavesDrawnOnLine++;

                const measuresPerLine = isFullscreen ? 4 : (containerWidth < 600 ? 2 : 3);
                if (stavesDrawnOnLine >= measuresPerLine) {
                    stavesDrawnOnLine = 0;
                }
                totalHeight = currentY + 120;
            }

            renderer.resize(containerWidth, totalHeight + 40);

        } catch (error) {
            console.error('Error al generar partitura:', error);
            showMessage("Error al generar la partitura: " + error.message, "danger");
            return false;
        }
        return true;
    }

    function showFullscreenPreview() {
        if (notes.length === 0) {
            showMessage('Debes agregar al menos una nota o silencio', 'danger');
            return;
        }
        document.getElementById('fullscreenModalTitle').textContent = scoreName;
        if (drawScore(fullscreenScore, true)) {
            fullscreenModal.show();
        }
    }

    async function downloadScore(container) {
        if (!container.hasChildNodes() || container.querySelector('svg') === null) {
            showMessage('Primero debes generar la partitura', 'danger');
            return;
        }
        try {
            showMessage('Generando PDF...', 'info');
            const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const imgWidth = pdfWidth - (2 * margin);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.setFontSize(18);
            pdf.text(scoreName, pdfWidth / 2, margin, { align: 'center' });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin + 10, imgWidth, imgHeight > (pdfHeight - margin - 20) ? (pdfHeight - margin - 20) : imgHeight);
            pdf.setFontSize(10);
            pdf.text("Generado con ConvertMusic", pdfWidth / 2, pdfHeight - 10, { align: 'center' });

            const fileName = `${(scoreName || 'partitura').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            pdf.save(fileName);
            showMessage('PDF descargado correctamente', 'success');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            showMessage('Error al generar el PDF: ' + error.message, 'danger');
        }
    }

    // Función para guardar la partitura actual
function saveCurrentScore() {
    if (!notes || notes.length === 0) {
        showMessage('No hay notas para guardar', 'warning');
        return false;
    }
    
    try {
        const scoreName = document.getElementById('name').value || 'Partitura sin nombre';
        const clef = document.getElementById('clef').value;
        const timeSignature = document.getElementById('timeSignature').value;
        const keySignature = document.getElementById('keySignature').value;
        const tempo = document.getElementById('tempo').value || 120;
        
        // Serializar las notas correctamente para VexFlow
        const serializedNotes = notes.map(note => {
            // Para silencios, usar posición según la clave
            const keys = note.duration.endsWith('r') ? 
                [clef === 'bass' ? 'd/3' : 'b/4'] : 
                [note.key];
            
            return {
                keys: keys,
                duration: note.duration,
                stem_direction: clef === 'bass' ? -1 : 1, // Dirección del tallo
                clef: clef
            };
        });
        
        const scoreData = {
            name: scoreName,
            clef: clef,
            timeSignature: timeSignature,
            keySignature: keySignature,
            tempo: tempo,
            notes: serializedNotes,
            timestamp: new Date().toISOString()
        };
        
        // Obtener partituras existentes
        let savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
        
        // Evitar duplicados exactos
        const isDuplicate = savedScores.some(existing => 
            JSON.stringify(existing.notes) === JSON.stringify(scoreData.notes) &&
            existing.clef === scoreData.clef &&
            existing.timeSignature === scoreData.timeSignature
        );
        
        if (isDuplicate) {
            showMessage('Esta partitura ya está guardada', 'warning');
            return false;
        }
        
        savedScores.push(scoreData);
        localStorage.setItem('savedScores', JSON.stringify(savedScores));
        
        showMessage(`"${scoreName}" guardada correctamente`, 'success');
        return true;
    } catch (error) {
        console.error('Error al guardar partitura:', error);
        showMessage('Error al guardar la partitura: ' + error.message, 'danger');
        return false;
    }
}

// Event listener para el botón de guardar
document.getElementById('saveScore')?.addEventListener('click', function() {
    // Validar que hay notas antes de guardar
    if (notes.length === 0) {
        showMessage('No hay notas para guardar', 'warning');
        return;
    }
    
    // Renderizar primero para validar
    const success = drawScore(scoreContent);
    if (success) {
        saveCurrentScore();
    }
});

// Event listener para el botón de ver partituras
document.getElementById('viewScores')?.addEventListener('click', function() {
    window.location.href = 'mis_partituras.html';
});
});