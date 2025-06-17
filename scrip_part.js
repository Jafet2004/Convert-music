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
    const addNoteBtn = document.getElementById('addNote');
    const drawScoreBtn = document.getElementById('drawScore');
    const clearScoreBtn = document.getElementById('clearScore');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const noteListDiv = document.getElementById('noteList');
    const scoreContentDiv = document.getElementById('score-content');
    const messageDiv = document.getElementById('message');
    
    // Función para mostrar mensajes
    function showMessage(text, type = 'info') {
        messageDiv.textContent = text;
        messageDiv.className = `alert alert-${type}`;
        
        if (type !== 'info') {
            setTimeout(() => {
                messageDiv.textContent = 'Selecciona tus notas y haz clic en "Dibujar Partitura"';
                messageDiv.className = 'alert alert-info';
            }, 3000);
        }
    }
    
    // Actualizar lista de notas
    function updateNoteList() {
        if (notes.length === 0) {
            noteListDiv.textContent = 'No hay elementos agregados aún';
            noteListDiv.className = 'p-3 bg-light border rounded empty';
            downloadPdfBtn.disabled = true;
            return;
        }
        
        noteListDiv.innerHTML = notes.map((note, index) => {
            if (note.duration.endsWith('r')) {
                const durationSymbol = getDurationSymbol(note.duration);
                return `<div>${index + 1}. ${durationSymbol}</div>`;
            } else {
                const noteName = getNoteName(note.key);
                const durationSymbol = getDurationSymbol(note.duration);
                return `<div>${index + 1}. ${noteName} ${durationSymbol}</div>`;
            }
        }).join('');
        
        noteListDiv.className = 'p-3 bg-light border rounded';
        downloadPdfBtn.disabled = false;
    }
    
    // Obtener nombre de la nota
    function getNoteName(noteValue) {
        const noteMap = {
            'c/4': 'Do', 'c#/4': 'Do#', 'd/4': 'Re', 'd#/4': 'Re#',
            'e/4': 'Mi', 'f/4': 'Fa', 'f#/4': 'Fa#', 'g/4': 'Sol',
            'g#/4': 'Sol#', 'a/4': 'La', 'bb/4': 'Sib', 'b/4': 'Si',
            'c/5': 'Do'
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
        
        // Validar que para notas musicales (no silencios) haya nota seleccionada
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
    });
    
    // Dibujar partitura
    drawScoreBtn.addEventListener('click', function() {
        scoreName = nameInput.value.trim() || "Partitura sin nombre";
        
        if (notes.length === 0) {
            showMessage('Debes agregar al menos una nota o silencio', 'danger');
            return;
        }
        
        try {
            // Limpiar el contenedor
            scoreContentDiv.innerHTML = '';
            
            // Obtener configuración seleccionada
            const clef = clefSelect.value || "treble";
            const timeSignature = timeSignatureSelect.value || "4/4";
            const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);
            
            // Calcular beats totales
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

            // Ajustar a compases completos
            const measures = Math.ceil(totalBeats / beatsPerMeasure);
            const totalBeatsNeeded = measures * beatsPerMeasure;
            
            // Crear notas/silencios
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
                
                // Agregar alteraciones
                if (note.key.includes('#')) {
                    staveNote.addAccidental(0, new VF.Accidental("#"));
                } else if (note.key.includes('b')) {
                    staveNote.addAccidental(0, new VF.Accidental("b"));
                }
                
                return staveNote;
            });

            // Agregar silencios de compensación si es necesario
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

            // Dividir las notas por compases
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
                    // Llenar el compás actual con silencios si es necesario
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
            
            // Agregar el último compás si queda algo
            if (currentMeasureNotes.length > 0) {
                measuresNotes.push(currentMeasureNotes);
            }

            // Configuración para múltiples líneas
            const staveWidth = 600;
            const staveHeight = 120;
            const measuresPerLine = 4;
            const totalLines = Math.ceil(measuresNotes.length / measuresPerLine);
            
            // Ajustar altura del contenedor
            scoreContentDiv.style.height = `${totalLines * staveHeight + 40}px`;
            
            // Crear renderer
            const renderer = new VF.Renderer(scoreContentDiv, VF.Renderer.Backends.SVG);
            renderer.resize(staveWidth, totalLines * staveHeight + 40);
            const context = renderer.getContext();
            
            // Dibujar cada línea de pentagramas
            for (let line = 0; line < totalLines; line++) {
                const startMeasure = line * measuresPerLine;
                const endMeasure = Math.min((line + 1) * measuresPerLine, measuresNotes.length);
                const lineMeasures = endMeasure - startMeasure;
                const measureWidth = staveWidth / lineMeasures;
                
                let currentX = 10;
                const currentY = 40 + line * staveHeight;
                
                // Configurar margen inicial basado en la clave
                let startX;
                switch(clef) {
                    case "bass":
                        startX = 70;  // Más espacio para clave de Fa
                        break;
                    case "alto":
                        startX = 70;  // Espacio intermedio para clave de Do
                        break;
                    case "treble":
                    default:
                        startX = 70;  // Espacio para clave de Sol
                }

                // Crear el primer pentagrama de la línea con clave y compás
                let stave = new VF.Stave(currentX, currentY, measureWidth);
                if (line === 0) {
                    stave.addClef(clef).addTimeSignature(timeSignature);
                } else {
                    stave.addClef(clef);
                }
                stave.setNoteStartX(startX);
                stave.setContext(context).draw();
                currentX += measureWidth;
                
                // Dibujar los pentagramas restantes de la línea
                for (let i = 1; i < lineMeasures; i++) {
                    stave = new VF.Stave(currentX, currentY, measureWidth);
                    
                    // Mostrar línea divisoria
                    if (i < lineMeasures) {
                        stave.setEndBarType(VF.Barline.type.SINGLE);
                    }
                    
                    stave.setContext(context).draw();
                    currentX += measureWidth;
                }

                // Dibujar las notas en cada compás de la línea
                currentX = 10;
                for (let i = 0; i < lineMeasures; i++) {
                    const measureIndex = startMeasure + i;
                    if (measureIndex >= measuresNotes.length) break;
                    
                    const measureNotes = measuresNotes[measureIndex];
                    
                    // Crear voz para el compás actual
                    const voice = new VF.Voice({
                        num_beats: beatsPerMeasure,
                        beat_value: beatValue,
                        resolution: Vex.Flow.RESOLUTION
                    });
                    
                    voice.addTickables(measureNotes);
                    
                    // Formatear las notas dentro del espacio del compás
                    new VF.Formatter()
                        .joinVoices([voice])
                        .format([voice], measureWidth - 20);
                    
                    // Crear un stave temporal para dibujar las notas
                    const tempStave = new VF.Stave(currentX, currentY, measureWidth);
                    tempStave.setContext(context);
                    
                    // Aplicar margen solo al primer compás de la primera línea
                    if (line === 0 && i === 0) {
                        tempStave.setNoteStartX(startX);
                    }
                    
                    // Dibujar las notas
                    voice.draw(context, tempStave);
                    
                    currentX += measureWidth;
                }
            }

            showMessage('Partitura generada correctamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al generar la partitura: ' + error.message, 'danger');
        }
    });
    
    // Limpiar todo
    clearScoreBtn.addEventListener('click', function() {
        if (notes.length === 0 && scoreContentDiv.innerHTML === '' && nameInput.value === '') {
            showMessage('No hay nada que limpiar', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres limpiar toda la partitura?')) {
            notes.length = 0;
            nameInput.value = '';
            noteSelect.value = 'seleccione';
            durationSelect.value = '';
            scoreContentDiv.innerHTML = '';
            scoreContentDiv.style.height = 'auto';
            updateNoteList();
            showMessage('Partitura limpiada', 'success');
        }
    });
    
    // Descargar PDF
    downloadPdfBtn.addEventListener('click', downloadPdf);
    
    async function downloadPdf() {
        if (!scoreContentDiv.hasChildNodes()) {
            showMessage('Primero debes generar la partitura', 'danger');
            return;
        }
        
        try {
            showMessage('Generando PDF...', 'info');
            
            const canvas = await html2canvas(scoreContentDiv, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm'
            });
            
            pdf.setFontSize(20);
            pdf.text(scoreName, 105, 15, { align: 'center' });
            
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
            pdf.save(`${scoreName}.pdf`);
            
            showMessage('PDF descargado correctamente', 'success');
        } catch (error) {
            console.error(error);
            showMessage('Error al generar PDF: ' + error.message, 'danger');
        }
    }
    
    // Inicialización
    updateNoteList();
    showMessage('Selecciona notas/silencios y haz clic en "Dibujar Partitura"', 'info');
});
