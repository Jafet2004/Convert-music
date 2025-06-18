// Configuración mejorada de teoría musical
const MUSIC_THEORY = {
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flats: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
    scales: {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10]
    },
    commonKeys: {
        'C': { chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', "Bdim"], weights: [6, 3, 2, 4, 5, 4], relative: 'Am' },
        'G': { chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', "F#dim"], weights: [6, 3, 2, 4, 5, 4], relative: 'Em' },
        'D': { chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', "C#dim"], weights: [6, 3, 2, 4, 5, 4], relative: 'Bm' },
        'A': { chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', "G#dim"], weights: [6, 3, 2, 4, 5, 4], relative: 'F#m' },
        'E': { chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', "D#dim"], weights: [6, 3, 2, 4, 5, 4], relative: 'C#m' },
        'F': { chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', "Edim"], weights: [6, 3, 2, 4, 5, 4], relative: 'Dm' },
        'Bb': { chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', "Adim"], weights: [6, 3, 2, 4, 5, 4], relative: 'Gm' },
        // Tonalidades menores
        'Am': { chords: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'C' },
        'Em': { chords: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'G' },
        'Bm': { chords: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'D' },
        'F#m': { chords: ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'A' },
        'C#m': { chords: ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'E' },
        'Dm': { chords: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'F' },
        'Gm': { chords: ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'], weights: [6, 1, 4, 3, 2, 3, 4], relative: 'Bb' }
    },
    keyPriority: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Am', 'Em', 'Bm', 'F#m', 'Dm', 'Gm']
};

// Función para extraer la raíz de un acorde
function getChordRoot(chord) {
    if (!chord || typeof chord !== 'string') return null;
    const match = chord.match(/^([A-Ga-g][#b]?)/i);
    return match ? match[1].toUpperCase() : null;
}

// Función para extraer notas de una melodía
function extractMelodyNotes(melody) {
    if (!melody) return [];
    
    // Convertir bemoles a sostenidos para consistencia
    const flatToSharp = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    
    return melody.split(/[\s,;]+/)
        .map(note => {
            note = note.trim().toUpperCase();
            return flatToSharp[note] || note;
        })
        .filter(note => {
            // Validar que sea una nota musical (C, C#, etc.)
            return MUSIC_THEORY.notes.includes(note);
        });
}

// Función para transponer una nota o acorde
function transposeChord(chord, steps) {
    if (!chord || typeof chord !== 'string') return chord;
    
    // Extraer la raíz y modificadores del acorde
    const match = chord.match(/^([A-Ga-g][#b]?)(.*)$/i);
    if (!match) return chord;
    
    const [_, root, modifiers] = match;
    const upperRoot = root.toUpperCase();
    
    // Encontrar índice de la nota
    let index = MUSIC_THEORY.notes.indexOf(upperRoot);
    if (index === -1) {
        index = MUSIC_THEORY.flats.indexOf(upperRoot);
        if (index === -1) return chord;
    }
    
    // Calcular nueva posición con manejo de overflow
    const newIndex = (index + parseInt(steps, 10) + 12) % 12;
    
    // Determinar si mantener sostenido o bemol
    const preferFlats = root.includes('b') || parseInt(steps, 10) < 0;
    const newRoot = preferFlats ? MUSIC_THEORY.flats[newIndex] : MUSIC_THEORY.notes[newIndex];
    
    return newRoot + (modifiers || '');
}

// Función mejorada para estimar tonalidad
function estimateKey(chords, melody = '') {
    if ((!chords || chords.length === 0) && !melody) return 'No determinado';
    
    const keyScores = {};
    const chordCount = {};
    const melodyNotes = extractMelodyNotes(melody);
    
    // Contar frecuencia de acordes y notas de la melodía
    chords.forEach(chord => {
        const root = getChordRoot(chord);
        if (root) {
            chordCount[root] = (chordCount[root] || 0) + 1;
        }
    });
    
    melodyNotes.forEach(note => {
        chordCount[note] = (chordCount[note] || 0) + 0.5; // Peso menor para notas melódicas
    });
    
    // Calcular puntuación para cada tonalidad (mayor y relativa menor)
    Object.keys(MUSIC_THEORY.commonKeys).forEach(key => {
        const { chords: keyChords, weights } = MUSIC_THEORY.commonKeys[key];
        keyScores[key] = 0;
        
        keyChords.forEach((kChord, i) => {
            const root = getChordRoot(kChord);
            if (root && chordCount[root]) {
                keyScores[key] += chordCount[root] * weights[i];
            }
        });
    });
    
    // Encontrar tonalidad con mayor puntuación
    let bestKey = 'No determinado';
    let maxScore = 0;
    
    MUSIC_THEORY.keyPriority.forEach(key => {
        if (keyScores[key] > maxScore) {
            maxScore = keyScores[key];
            bestKey = key;
        }
    });
    
    // Umbral mínimo para considerar válido (ajustado para melodías)
    const totalElements = chords.length + (melodyNotes.length * 0.5);
    return maxScore >= totalElements * 1.2 ? bestKey : 'No determinado';
}

// Función para obtener los semitonos actuales
function getCurrentSteps() {
    const stepsText = document.getElementById('current-steps').textContent;
    const match = stepsText.match(/-?\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

// Función para actualizar la interfaz
function updateUI(originalChords, transposedChords, steps, originalMelody = '', transposedMelody = '') {
    document.getElementById('original-melody').textContent = 
        originalChords.length ? originalChords.join(', ') : '-';
    document.getElementById('transposed-melody').textContent = 
        transposedChords.length ? transposedChords.join(', ') : '-';
    
    document.getElementById('current-steps').textContent = 
        `${steps > 0 ? '+' : ''}${steps} semitono${Math.abs(steps) !== 1 ? 's' : ''}`;
    
    // Mostrar melodía original y transuesta si existe
    if (originalMelody) {
        document.getElementById('original-melody').textContent += ` | Melodía: ${originalMelody}`;
        document.getElementById('transposed-melody').textContent += ` | Melodía: ${transposedMelody}`;
    }
    
    // Estimar tonalidad considerando melodía
    document.getElementById('estimated-key').textContent = 
        originalChords.length || originalMelody ? 
        estimateKey(originalChords, originalMelody) : '-';
    document.getElementById('new-key').textContent = 
        transposedChords.length || transposedMelody ? 
        estimateKey(transposedChords, transposedMelody) : '-';
}

// Función principal de transposición
function transposeMelody(steps) {
    try {
        const input = document.getElementById('melody-input').value.trim();
        if (!input) {
            updateUI([], [], 0);
            return;
        }
        
        // Procesar acordes y melodía
        const elements = input.split(/[,;\s]+/)
            .map(el => el.trim())
            .filter(el => el);
        
        const chords = elements.filter(el => /^[A-Ga-g][#b]?/i.test(el));
        const melody = elements.filter(el => !/^[A-Ga-g][#b]?/i.test(el)).join(' ');
        
        if (chords.length === 0 && !melody) {
            updateUI([], [], 0);
            return;
        }
        
        // Calcular nuevos semitonos
        const currentSteps = getCurrentSteps();
        const newSteps = currentSteps + parseInt(steps, 10);
        
        // Transponer acordes
        const transposedChords = chords.map(chord => transposeChord(chord, steps));
        
        // Transponer notas de la melodía
        const transposedMelody = melody ? melody.split(' ')
            .map(note => {
                if (/^[A-Ga-g][#b]?/i.test(note)) {
                    return transposeChord(note, steps);
                }
                return note;
            }).join(' ') : '';
        
        // Actualizar interfaz
        updateUI(
            chords, 
            transposedChords, 
            newSteps,
            melody,
            transposedMelody
        );
        
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error. Por favor verifica los acordes o notas ingresadas.');
    }
}

// Función para reiniciar la transposición
function resetTransposition() {
    const input = document.getElementById('melody-input').value.trim();
    const elements = input.split(/[,;\s]+/)
        .map(el => el.trim())
        .filter(el => el);
    
    const chords = elements.filter(el => /^[A-Ga-g][#b]?/i.test(el));
    const melody = elements.filter(el => !/^[A-Ga-g][#b]?/i.test(el)).join(' ');
    
    updateUI(chords, chords, 0, melody, melody);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.transpose-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const steps = btn.getAttribute('data-steps');
            if (steps && !isNaN(parseInt(steps, 10))) {
                transposeMelody(steps);
            }
        });
    });
    
    document.getElementById('melody-input').addEventListener('input', () => {
        setTimeout(resetTransposition, 300); // Debounce para mejor performance
    });
    
    document.getElementById('reset-btn').addEventListener('click', resetTransposition);
    
    resetTransposition();
});