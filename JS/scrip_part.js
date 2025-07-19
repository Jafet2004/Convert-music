document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const VF = Vex.Flow;
    let notes = [];
    let scoreName = "Mi melodía";
    let audioContext;
    let isPlaying = false;
    let playTimeout;

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
    const playScoreBtn = document.getElementById('playScore');
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

    // Cargar partitura si hay una guardada para editar
    const scoreToLoad = localStorage.getItem('currentScoreToLoad');
    if (scoreToLoad) {
        try {
            const score = JSON.parse(scoreToLoad);
            loadScoreData(score);
            localStorage.removeItem('currentScoreToLoad');
        } catch (error) {
            console.error('Error al cargar partitura:', error);
            showMessage('Error al cargar la partitura', 'danger');
        }
    }

    // Inicialización
    init();

    function init() {
        nameInput.addEventListener('change', updateScoreName);
        clefSelect.addEventListener('change', () => updateNoteOptions(clefSelect.value));
        addNoteBtn.addEventListener('click', addNote);
        clearNoteBtn.addEventListener('click', clearLastNote);
        clearAllBtn.addEventListener('click', clearAllNotes);
        drawScoreBtn.addEventListener('click', drawScoreHandler);
        previewScoreBtn.addEventListener('click', showFullscreenPreview);
        downloadPdfBtn.addEventListener('click', () => downloadScore(scoreContent));
        downloadFromModalBtn.addEventListener('click', () => downloadScore(fullscreenScore));
        playScoreBtn.addEventListener('click', togglePlayback);

        updateScoreName();
        updateNoteOptions(clefSelect.value);
        updateNoteList();
        showMessage('Selecciona notas/silencios y haz clic en "Ver Partitura"', 'info');
    }

    function togglePlayback() {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    }

    function stopPlayback() {
        isPlaying = false;
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        if (playTimeout) {
            clearTimeout(playTimeout);
            playTimeout = null;
        }
        updatePlayButton();
    }

    function startPlayback() {
        if (notes.length === 0) {
            showMessage('No hay notas para reproducir', 'warning');
            return;
        }
        
        isPlaying = true;
        updatePlayButton();
        
        try {
            // Crear contexto de audio si no existe
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const tempo = parseInt(tempoInput.value) || 120;
            const bpmFactor = 60 / tempo; // segundos por negra
            
            // Calcular duración en segundos para cada nota
            let currentTime = 0;
            
            notes.forEach((note, index) => {
                const duration = getNoteDurationInSeconds(note.duration, bpmFactor);
                
                if (!note.duration.endsWith('r')) { // Si no es un silencio
                    playTimeout = setTimeout(() => {
                        if (!isPlaying) return;
                        
                        const frequency = getNoteFrequency(note.key);
                        playNote(frequency, duration);
                    }, currentTime * 1000);
                }
                
                currentTime += duration;
            });
            
            // Detener la reproducción al final
            playTimeout = setTimeout(() => {
                stopPlayback();
            }, currentTime * 1000);
            
        } catch (error) {
            console.error('Error al reproducir:', error);
            showMessage('Error al reproducir: ' + error.message, 'danger');
            stopPlayback();
        }
    }

    function getNoteDurationInSeconds(duration, bpmFactor) {
        // bpmFactor es la duración de una negra en segundos
        switch(duration.replace('r', '')) {
            case 'w': return bpmFactor * 4; // redonda = 4 negras
            case 'h': return bpmFactor * 2; // blanca = 2 negras
            case 'q': return bpmFactor;     // negra = 1 negra
            case '8': return bpmFactor / 2; // corchea = 1/2 negra
            case '16': return bpmFactor / 4; // semicorchea = 1/4 negra
            default: return bpmFactor;
        }
    }

    function getNoteFrequency(noteValue) {
        // Mapeo de notas a frecuencias (en Hz)
        const noteMap = {
            'c/2': 65.41, 'd/2': 73.42, 'e/2': 82.41, 'f/2': 87.31, 'g/2': 98.00, 'a/2': 110.00, 'b/2': 123.47,
            'c/3': 130.81, 'd/3': 146.83, 'e/3': 164.81, 'f/3': 174.61, 'g/3': 196.00, 'a/3': 220.00, 'b/3': 246.94,
            'c/4': 261.63, 'd/4': 293.66, 'e/4': 329.63, 'f/4': 349.23, 'g/4': 392.00, 'a/4': 440.00, 'b/4': 493.88,
            'c/5': 523.25, 'd/5': 587.33, 'e/5': 659.25, 'f/5': 698.46, 'g/5': 783.99, 'a/5': 880.00, 'b/5': 987.77
        };
        
        return noteMap[noteValue] || 440; // La4 como valor por defecto
    }

    function playNote(frequency, duration) {
        if (!audioContext || !isPlaying) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine'; // Puedes cambiar a 'square', 'sawtooth' o 'triangle' para diferentes timbres
        oscillator.frequency.value = frequency;
        
        // Configurar envolvente para que el sonido no sea demasiado abrupto
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }

    function updatePlayButton() {
        if (isPlaying) {
            playScoreBtn.innerHTML = '<i class="fas fa-stop me-1"></i> <span class="d-none d-sm-inline">Detener</span>';
            playScoreBtn.classList.remove('btn-info');
            playScoreBtn.classList.add('btn-danger');
        } else {
            playScoreBtn.innerHTML = '<i class="fas fa-play me-1"></i> <span class="d-none d-sm-inline">Reproducir</span>';
            playScoreBtn.classList.remove('btn-danger');
            playScoreBtn.classList.add('btn-info');
        }
    }

    function loadScoreData(score) {
        try {
            // Validar que la partitura tenga los datos necesarios
            if (!score || !score.clef || !score.notes || !Array.isArray(score.notes)) {
                throw new Error('Datos de partitura incompletos');
            }

            // Cargar los valores básicos
            document.getElementById('name').value = score.name || '';
            document.getElementById('clef').value = score.clef;
            document.getElementById('timeSignature').value = score.timeSignature;
            document.getElementById('keySignature').value = score.keySignature;
            document.getElementById('tempo').value = score.tempo || 120;
            
            // Actualizar las opciones de notas según la clave
            updateNoteOptions(score.clef);
            
            // Cargar las notas
            notes = score.notes.map(note => {
                return {
                    key: note.keys[0], // Tomamos la primera nota (puede ser un silencio)
                    duration: note.duration
                };
            });
            
            // Actualizar la lista de notas
            updateNoteList();
            enableButtons();
            
            // Mostrar mensaje
            showMessage(`Partitura "${score.name}" cargada correctamente`, 'success');
            
            // Renderizar automáticamente después de un pequeño retraso
            setTimeout(() => {
                drawScoreHandler();
            }, 100);
            
        } catch (error) {
            console.error('Error al cargar datos de partitura:', error);
            showMessage('Error al cargar los datos de la partitura: ' + error.message, 'danger');
        }
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
        playScoreBtn.disabled = false;
    }

    function disableButtons() {
        drawScoreBtn.disabled = true;
        previewScoreBtn.disabled = true;
        downloadPdfBtn.disabled = true;
        playScoreBtn.disabled = true;
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
        if (noteData.duration.endsWith('r')) {
            keys = [clef === 'bass' ? 'd/3' : 'b/4'];
        } else {
            keys = [noteData.key];
        }
        return new VF.StaveNote({ keys: keys, duration: noteData.duration, clef: clef, auto_stem: true });
    }

    function getDurationFromTicks(ticks) {
        const quarterTicks = VF.RESOLUTION / 4;
        
        if (ticks === quarterTicks) return 'qr';
        if (ticks === quarterTicks / 2) return '8r';
        if (ticks === quarterTicks / 4) return '16r';
        if (ticks === quarterTicks * 2) return 'hr';
        if (ticks === quarterTicks * 4) return 'wr';
        
        if (ticks > quarterTicks * 2) return 'wr';
        if (ticks > quarterTicks) return 'hr';
        if (ticks > quarterTicks / 2) return 'qr';
        return '16r';
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

            const vexNotes = notes.map(createVexFlowNote);

            const measures = [];
            let currentMeasure = [];
            let currentTicks = 0;
            
            vexNotes.forEach(note => {
                const noteTicks = note.getTicks().value();
                
                if (currentTicks + noteTicks > ticksPerMeasure) {
                    const remainingTicks = ticksPerMeasure - currentTicks;
                    
                    if (remainingTicks > 0) {
                        try {
                            const restDuration = getDurationFromTicks(remainingTicks);
                            currentMeasure.push(new VF.GhostNote({ duration: restDuration }));
                            currentTicks += remainingTicks;
                        } catch (e) {
                            console.warn("No se pudo crear silencio para", remainingTicks, "ticks");
                        }
                    }
                    
                    measures.push(currentMeasure);
                    currentMeasure = [note];
                    currentTicks = noteTicks;
                } else {
                    currentMeasure.push(note);
                    currentTicks += noteTicks;
                }
            });

            if (currentMeasure.length > 0) {
                const remainingTicks = ticksPerMeasure - currentTicks;
                
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

            const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
            const containerWidth = container.clientWidth;
            renderer.resize(containerWidth, 500);
            const context = renderer.getContext();

            const staveWidth = isFullscreen ? (containerWidth / 4) : (containerWidth / 3);
            const headerWidth = 120;
            const noteStaveWidth = staveWidth - 20;

            let currentX = 0;
            let currentY = 40;
            let stavesDrawnOnLine = 0;
            let totalHeight = 0;

            for (let i = 0; i < measures.length; i++) {
                const isFirstMeasureOfLine = stavesDrawnOnLine === 0;
                let stave;

                if (isFirstMeasureOfLine) {
                    currentX = 0;
                    if (i > 0) currentY += 120;
                    stave = new VF.Stave(currentX, currentY, headerWidth);
                    stave.addClef(clef);
                    if (i === 0) {
                        stave.addKeySignature(key);
                        stave.addTimeSignature(timeSignature);
                        stave.setTempo({ duration: 'q', bpm: tempo }, -10);
                    }
                    stave.setContext(context).draw();
                    currentX += headerWidth;
                }

                stave = new VF.Stave(currentX, currentY, noteStaveWidth);
                stave.setContext(context).draw();

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

        fullscreenScore.innerHTML = '';
        const scoreClone = scoreContent.cloneNode(true);
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

    async function downloadScore(container) {
        if (!container.hasChildNodes() || container.querySelector('svg') === null) {
            showMessage('Primero debes generar la partitura', 'danger');
            return;
        }
        try {
            showMessage('Generando PDF...', 'info');
            
            // Crear contenedor temporal para tamaño carta
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = '8.5in';
            tempContainer.style.height = '11in';
            tempContainer.style.padding = '0.5in';
            tempContainer.style.backgroundColor = 'white';
            tempContainer.style.boxSizing = 'border-box';
            
            // Clonar el contenido y escalarlo para que quepa
            const clone = container.cloneNode(true);
            clone.style.transform = 'scale(0.9)';
            clone.style.transformOrigin = 'top left';
            tempContainer.appendChild(clone);
            document.body.appendChild(tempContainer);
            
            // Configuración de html2canvas para tamaño carta
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                width: 8.5 * 96,
                height: 11 * 96,
                logging: false,
                useCORS: true
            });
            
            document.body.removeChild(tempContainer);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            // Añadir imagen al PDF ajustada a tamaño carta
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            // Texto centrado en el PDF
            pdf.setFontSize(12);
            pdf.setTextColor(100);
            pdf.text(`${scoreName}`, pdfWidth / 2, 0.5, { align: 'center' });
            pdf.text("Generado con @ConvertMusic", pdfWidth / 2, pdfHeight - 0.5, { align: 'center' });

            const fileName = `${(scoreName || 'partitura').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
            pdf.save(fileName);
            
            // Mostrar animación de descarga mejorada
            showDownloadNotification(scoreName);
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            showMessage('Error al generar el PDF: ' + error.message, 'danger');
        }
    }

    function showDownloadNotification(scoreName) {
        const notification = document.createElement('div');
        notification.className = 'download-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1050;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="font-size:24px;margin-right:10px;"></i>
            <div>
                <div style="font-weight:bold;">¡Descarga completada!</div>
                <div style="font-size:0.9em;opacity:0.9;">"${scoreName}" se ha descargado correctamente</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Eliminar después de 3 segundos con animación
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

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
            
            const serializedNotes = notes.map(note => {
                const keys = note.duration.endsWith('r') ? 
                    [clef === 'bass' ? 'd/3' : 'b/4'] : 
                    [note.key];
                
                return {
                    keys: keys,
                    duration: note.duration,
                    stem_direction: clef === 'bass' ? -1 : 1,
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
            
            let savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
            
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

    document.getElementById('saveScore')?.addEventListener('click', function() {
        if (notes.length === 0) {
            showMessage('No hay notas para guardar', 'warning');
            return;
        }
        
        const success = drawScore(scoreContent);
        if (success) {
            saveCurrentScore();
        }
    });

    document.getElementById('viewScores')?.addEventListener('click', function() {
        window.location.href = 'mis_partituras.html';
    });
});