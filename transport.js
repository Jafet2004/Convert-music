// Función para transponer acordes
function transposeChord(chord, steps) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    // Extraer la parte del acorde (C, D#, etc.) y los modificadores (m, 7, etc.)
    const chordParts = chord.match(/([A-Ga-g][#b]?)(.*)/);
    if (!chordParts) return chord;
    
    const note = chordParts[1].toUpperCase(); // Convertir a mayúsculas para consistencia
    const modifier = chordParts[2] || '';
    
    // Encontrar el índice de la nota original
    let index = notes.indexOf(note);
    if (index === -1) {
        index = flats.indexOf(note);
        if (index === -1) return chord; // Si no se encuentra, devolver el acorde original
    }
    
    // Calcular nueva posición
    let newIndex = (index + parseInt(steps) + 12) % 12;
    
    // Obtener la nueva nota (usando sostenidos por defecto)
    let newNote = notes[newIndex];
    
    // Si la nota original era bemol, intentar mantener la notación
    if (note.includes('b') && flats[newIndex]) {
        newNote = flats[newIndex];
    }
    
    return newNote + modifier;
}

// Función para estimar la tonalidad de una progresión
function estimateKey(chords) {
    const commonKeys = {
        'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'G7', 'C7'],
        'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'D7', 'G7'],
        'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'A7', 'D7'],
        'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'E7', 'A7'],
        'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'B7', 'E7'],
        'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'F#7', 'B7'],
        'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'C#7', 'F#7'],
        'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'C7', 'F7'],
        'Bb': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'F7', 'Bb7'],
        'Eb': ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Bb7', 'Eb7'],
        'Ab': ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Eb7', 'Ab7'],
        'Db': ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Ab7', 'Db7']
    };
    
    let bestKey = '';
    let maxMatches = 0;
    
    for (const key in commonKeys) {
        const matches = chords.filter(chord => commonKeys[key].includes(chord)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestKey = key;
        } else if (matches === maxMatches && maxMatches > 0) {
            // En caso de empate, preferir tonalidades más comunes
            const commonOrder = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
            if (commonOrder.indexOf(key) < commonOrder.indexOf(bestKey)) {
                bestKey = key;
            }
        }
    }
    
    return bestKey || 'No se pudo determinar';
}

// Función para transponer una melodía completa
function transposeMelody(steps) {
    const input = document.getElementById('melody-input').value;
    
    // Limpiar y separar los acordes
    const chords = input.split(/\s*,\s*|\s+/).map(chord => chord.trim()).filter(chord => chord);
    
    if (chords.length === 0) {
        alert('Por favor ingresa una melodía válida');
        return;
    }
    
    // Transponer cada acorde
    const transposedChords = chords.map(chord => transposeChord(chord, steps));
    
    // Mostrar resultados
    document.getElementById('original-melody').textContent = chords.join(', ');
    document.getElementById('transposed-melody').textContent = transposedChords.join(', ');
    
    // Actualizar indicador de semitonos
    const currentSteps = parseInt(document.getElementById('current-steps').textContent.match(/-?\d+/)[0] || 0);
    const newSteps = currentSteps + parseInt(steps);
    document.getElementById('current-steps').textContent = `${newSteps > 0 ? '+' : ''}${newSteps} semitono${Math.abs(newSteps) !== 1 ? 's' : ''}`;
    
    // Estimar tonalidades
    const originalKey = estimateKey(chords);
    document.getElementById('estimated-key').textContent = originalKey;
    
    const newKey = estimateKey(transposedChords);
    document.getElementById('new-key').textContent = newKey;
}

// Función para resetear la transposición
function resetTransposition() {
    document.getElementById('current-steps').textContent = '0 semitonos';
    const input = document.getElementById('melody-input').value;
    const chords = input.split(/\s*,\s*|\s+/).map(chord => chord.trim()).filter(chord => chord);
    
    if (chords.length > 0) {
        document.getElementById('original-melody').textContent = chords.join(', ');
        document.getElementById('transposed-melody').textContent = chords.join(', ');
        const originalKey = estimateKey(chords);
        document.getElementById('estimated-key').textContent = originalKey;
        document.getElementById('new-key').textContent = originalKey;
    }
}

// Añadir event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Botones de transposición
    document.querySelectorAll('.transpose-btn').forEach(button => {
        button.addEventListener('click', function() {
            const steps = this.getAttribute('data-steps');
            transposeMelody(steps);
        });
    });
    
    // Botón de reset (si existe)
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTransposition);
    }
    
    // También podemos transponer cuando se cambia el texto (opcional)
    document.getElementById('melody-input').addEventListener('input', resetTransposition);
});