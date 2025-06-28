// Función para guardar la partitura actual - Versión mejorada
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

// Event listener mejorado para el botón de guardar
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
            card.onclick = () => showScoreModal(score);
            
            // Icono de clave
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
                            <span class="badge bg-warning text-dark">${score.tempo} BPM</span>
                        </div>
                        <small class="text-muted">Creada: ${new Date(score.timestamp).toLocaleString()}</small>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-sm btn-outline-danger delete-score" data-index="${index}">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            `;
            
            col.appendChild(card);
            container.appendChild(col);
        });
        
        // Event listeners para botones de eliminar
        document.querySelectorAll('.delete-score').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                deleteScore(index);
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

// Función auxiliar para obtener nombre de clave
function getClefName(clef) {
    switch(clef) {
        case 'treble': return 'Clave de Sol';
        case 'bass': return 'Clave de Fa';
        case 'alto': return 'Clave de Do';
        default: return clef;
    }
}

// Función para eliminar partitura
function deleteScore(index) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta partitura?')) return;
    
    const savedScores = JSON.parse(localStorage.getItem('savedScores') || '[]');
    savedScores.splice(index, 1);
    localStorage.setItem('savedScores', JSON.stringify(savedScores));
    
    loadSavedScores();
    showMessage('Partitura eliminada correctamente', 'success');
}