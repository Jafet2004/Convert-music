document.addEventListener('DOMContentLoaded', function() {
    const VF = Vex.Flow;
    const notes = [];
    let scoreName = "Partitura sin nombre";
    
    // Elementos del DOM
    const nameInput = document.getElementById('name');
    const noteSelect = document.getElementById('note');
    const durationSelect = document.getElementById('duration');
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
                messageDiv.textContent = '';
                messageDiv.className = 'alert';
            }, 3000);
        }
    }
    
    // Actualizar lista de notas
    function updateNoteList() {
        if (notes.length === 0) {
            noteListDiv.textContent = 'No hay elementos agregados aún';
            noteListDiv.className = 'empty';
            downloadPdfBtn.disabled = true;
            return;
        }
        
        noteListDiv.innerHTML = notes.map((note, index) => {
            if (note.duration.endsWith('r')) {
                const durationSymbol = getDurationSymbol(note.duration);
                return `<div>${index + 1}. Silencio ${durationSymbol}</div>`;
            } else {
                const noteName = getNoteName(note.key);
                const durationSymbol = getDurationSymbol(note.duration);
                return `<div>${index + 1}. ${noteName} ${durationSymbol}</div>`;
            }
        }).join('');
        
        noteListDiv.className = '';
        downloadPdfBtn.disabled = false;
    }
    
    // Obtener nombre de la nota
    function getNoteName(noteValue) {
        const noteMap = {
            'c/4': 'Do', 'c#/4': 'Do#', 'd/4': 'Re', 'd#/4': 'Re#',
            'e/4': 'Mi', 'f/4': 'Fa', 'f#/4': 'Fa#', 'g/4': 'Sol',
            'g#/4': 'Sol#', 'a/4': 'La', 'ab/4': 'Sib', 'B/4': 'Si',
            'c/5': 'Do'
        };
        return noteMap[noteValue] || noteValue;
    }
    
    // Obtener símbolo de duración
    function getDurationSymbol(duration) {
        const durationMap = {
            'q': 'Negra (♪)', '8': 'Corchea (♫)', '16': 'Semicorchea (♬)',
            'h': 'Blanca (𝅗)', 'w': 'Redonda (𝅝)', 'qr': 'de negra (𝄽)',
            '8r': 'de corchea (𝄾)', '16r': 'de semicorchea (𝄿)',
            'hr': 'de blanca (𝄻)', 'wr': 'de redonda (𝄺)'
        };
        return durationMap[duration] || duration;
    }
    
    // Validar selección antes de agregar nota
    function validateSelection() {
        if (!durationSelect.value) {
            showMessage('Debes seleccionar una duración', 'danger');
            return false;
        }
        
        if (!noteSelect.value && !durationSelect.value.endsWith('r')) {
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
            const durationName = durationSelect.options[durationSelect.selectedIndex].text.split('(')[0].trim();
            notes.push({
                key: '',
                duration: duration,
                name: 'Silencio'
            });
            showMessage(`Silencio ${durationName} agregado`, 'success');
        } else {
            const noteName = noteSelect.options[noteSelect.selectedIndex].text.split('(')[0].trim();
            const durationName = durationSelect.options[durationSelect.selectedIndex].text.split('(')[0].trim();
            notes.push({
                key: selectedNote,
                duration: duration,
                name: noteName
            });
            showMessage(`Nota ${noteName} (${durationName}) agregada`, 'success');
        }
        
        // Resetear selecciones
        noteSelect.value = '';
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
            
            // Crear renderer
            const renderer = new VF.Renderer(scoreContentDiv, VF.Renderer.Backends.SVG);
            renderer.resize(650, 200);
            const context = renderer.getContext();
            
            // Crear pentagrama
            const stave = new VF.Stave(10, 40, 600);
            stave.addClef("treble").addTimeSignature("4/4");
            stave.setContext(context).draw();
            
            // Calcular beats totales
            let totalBeats = 0;
            notes.forEach(note => {
                const dur = note.duration.replace('r', '');
                totalBeats += 
                    dur === 'w' ? 4 :
                    dur === 'h' ? 2 :
                    dur === 'q' ? 1 :
                    dur === '8' ? 0.5 :
                    dur === '16' ? 0.25 : 1;
            });

            // Ajustar a compases completos
            const measures = Math.ceil(totalBeats / 4);
            const totalBeatsNeeded = measures * 4;
            
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
                    clef: "treble"
                });
                
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
                
                if (remainingBeats >= 4) compensationDuration = 'w';
                else if (remainingBeats >= 2) compensationDuration = 'h';
                else if (remainingBeats >= 1) compensationDuration = 'q';
                else if (remainingBeats >= 0.5) compensationDuration = '8';
                else compensationDuration = '16';
                
                staveNotes.push(new VF.GhostNote({
                    duration: compensationDuration,
                    align_center: true
                }));
            }

            // Crear voz
            const voice = new VF.Voice({
                num_beats: totalBeatsNeeded,
                beat_value: 4,
                resolution: Vex.Flow.RESOLUTION
            });
            
            voice.addTickables(staveNotes);
            
            // Formatear y dibujar
            new VF.Formatter()
                .joinVoices([voice])
                .format([voice], 580);
            
            voice.draw(context, stave);
            
            showMessage('Partitura generada correctamente');
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
            scoreContentDiv.innerHTML = '';
            updateNoteList();
            showMessage('Partitura limpiada', 'info');
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