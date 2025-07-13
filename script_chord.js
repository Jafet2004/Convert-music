// Datos completos de acordes para guitarra y piano
const chordsData = [
    // =============================================
    // ACORDES MAYORES - GUITARRA (CORREGIDOS)
    // =============================================
    {
        name: "C",
        type: "major",
        notes: ["C", "E", "G"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 3, finger: 3 },
            { string: 4, fret: 2, finger: 2 },
            { string: 2, fret: 1, finger: 1 }
        ],
        muted: [6],
        open: [3, 1]
    },
    {
        name: "G",
        type: "major",
        notes: ["G", "B", "D"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 3, finger: 3 },
            { string: 5, fret: 2, finger: 2 },
            { string: 1, fret: 3, finger: 4 }
        ],
        open: [4, 3, 2]
    },
    {
        name: "D",
        type: "major",
        notes: ["D", "F#", "A"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 3, fret: 2, finger: 1 },
            { string: 1, fret: 2, finger: 3 },
            { string: 2, fret: 3, finger: 2 }
        ],
        muted: [6, 5],
        open: [4]
    },
    {
        name: "A",
        type: "major",
        notes: ["A", "C#", "E"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 4, fret: 2, finger: 1 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 2, finger: 3 }
        ],
        open: [5, 1]
    },
    {
        name: "E",
        type: "major",
        notes: ["E", "G#", "B"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 3, fret: 1, finger: 1 },
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 3 }
        ],
        open: [6, 2, 1]
    },
    {
        name: "F",
        type: "major",
        notes: ["F", "A", "C"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 1, finger: 1, barre: { from: 1, to: 6 } },
            { string: 5, fret: 3, finger: 3 },
            { string: 4, fret: 3, finger: 4 },
            { string: 3, fret: 2, finger: 2 }
        ]
    },
    {
        name: "B",
        type: "major",
        notes: ["B", "D#", "F#"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 2, finger: 1, barre: { from: 1, to: 5 } },
            { string: 4, fret: 4, finger: 4 },
            { string: 3, fret: 4, finger: 3 },
            { string: 2, fret: 4, finger: 2 }
        ],
        muted: [6]
    },

    // =============================================
    // ACORDES MENORES - GUITARRA (CORREGIDOS)
    // =============================================
    {
        name: "Am",
        type: "minor",
        notes: ["A", "C", "E"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 4, fret: 2, finger: 1 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 1, finger: 3 }
        ],
        open: [5, 1]
    },
    {
        name: "Em",
        type: "minor",
        notes: ["E", "G", "B"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 3 }
        ],
        open: [6, 3, 2, 1]
    },
    {
        name: "Dm",
        type: "minor",
        notes: ["D", "F", "A"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 3, fret: 2, finger: 1 },
            { string: 1, fret: 1, finger: 3 },
            { string: 2, fret: 3, finger: 2 }
        ],
        muted: [6, 5],
        open: [4]
    },
    {
        name: "Cm",
        type: "minor",
        notes: ["C", "D#", "G"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 3, finger: 3 },
            { string: 4, fret: 1, finger: 1 },
            { string: 2, fret: 1, finger: 2 }
        ],
        muted: [6],
        open: [3]
    },
    {
        name: "Gm",
        type: "minor",
        notes: ["G", "A#", "D"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 3, finger: 1 },
            { string: 5, fret: 1, finger: 2 },
            { string: 3, fret: 3, finger: 4 }
        ],
        muted: [4],
        open: [2, 1]
    },
    {
        name: "Bm",
        type: "minor",
        notes: ["B", "D", "F#"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 2, finger: 1, barre: { from: 1, to: 5 } },
            { string: 4, fret: 4, finger: 4 },
            { string: 3, fret: 4, finger: 3 },
            { string: 2, fret: 3, finger: 2 }
        ],
        muted: [6]
    },
    {
        name: "F#m",
        type: "minor",
        notes: ["F#", "A", "C#"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 2, finger: 1, barre: { from: 1, to: 6 } },
            { string: 5, fret: 4, finger: 3 },
            { string: 4, fret: 4, finger: 4 }
        ]
    },

    // =============================================
    // ACORDES CON SOSTENIDOS/BEMOLES - GUITARRA (CORREGIDOS)
    // =============================================
    {
        name: "C#",
        type: "major",
        notes: ["C#", "F", "G#"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 4, fret: 1, finger: 1 },
            { string: 3, fret: 1, finger: 1, barre: { from: 3, to: 1 } },
            { string: 2, fret: 2, finger: 2 },
            { string: 1, fret: 1, finger: 1 }
        ],
        muted: [6, 5]
    },
    {
        name: "F#",
        type: "major",
        notes: ["F#", "A#", "C#"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 2, finger: 1, barre: { from: 1, to: 6 } },
            { string: 5, fret: 4, finger: 3 },
            { string: 4, fret: 4, finger: 4 },
            { string: 3, fret: 3, finger: 2 }
        ]
    },
    {
        name: "Bb",
        type: "major",
        notes: ["Bb", "D", "F"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 1, finger: 1 },
            { string: 4, fret: 3, finger: 3 },
            { string: 3, fret: 3, finger: 4 },
            { string: 2, fret: 3, finger: 2 }
        ],
        muted: [6]
    },
    {
        name: "Eb",
        type: "major",
        notes: ["Eb", "G", "Bb"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 6, finger: 1 },
            { string: 5, fret: 8, finger: 4 },
            { string: 4, fret: 8, finger: 3 },
            { string: 3, fret: 7, finger: 2 }
        ],
        muted: [2, 1]
    },
    {
        name: "Ab",
        type: "major",
        notes: ["Ab", "C", "Eb"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 4, fret: 1, finger: 1 },
            { string: 3, fret: 1, finger: 1, barre: { from: 3, to: 1 } },
            { string: 2, fret: 2, finger: 2 }
        ],
        muted: [6, 5]
    },
    {
        name: "Db",
        type: "major",
        notes: ["Db", "F", "Ab"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 4, finger: 1 },
            { string: 4, fret: 1, finger: 2 },
            { string: 3, fret: 2, finger: 3 },
            { string: 2, fret: 2, finger: 4 }
        ],
        muted: [6, 1]
    },

    // =============================================
    // ACORDES DE SÉPTIMA - GUITARRA (CORREGIDOS)
    // =============================================
    {
        name: "C7",
        type: "7",
        notes: ["C", "E", "G", "Bb"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 3, finger: 3 },
            { string: 4, fret: 2, finger: 2 },
            { string: 3, fret: 3, finger: 4 }
        ],
        open: [2, 1]
    },
    {
        name: "G7",
        type: "7",
        notes: ["G", "B", "D", "F"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 6, fret: 3, finger: 3 },
            { string: 5, fret: 2, finger: 2 },
            { string: 3, fret: 3, finger: 4 }
        ],
        open: [4, 2, 1]
    },
    {
        name: "D7",
        type: "7",
        notes: ["D", "F#", "A", "C"],
        difficulty: "medium",
        instrument: "guitar",
        diagram: [
            { string: 3, fret: 2, finger: 1 },
            { string: 2, fret: 1, finger: 2 },
            { string: 1, fret: 2, finger: 3 }
        ],
        open: [4]
    },
    {
        name: "A7",
        type: "7",
        notes: ["A", "C#", "E", "G"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 4, fret: 2, finger: 1 },
            { string: 3, fret: 2, finger: 2 },
            { string: 2, fret: 0, finger: 0 }
        ],
        open: [5, 1]
    },
    {
        name: "E7",
        type: "7",
        notes: ["E", "G#", "B", "D"],
        difficulty: "easy",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 2, finger: 2 },
            { string: 3, fret: 1, finger: 1 }
        ],
        open: [6, 4, 2, 1]
    },
    {
        name: "B7",
        type: "7",
        notes: ["B", "D#", "F#", "A"],
        difficulty: "hard",
        instrument: "guitar",
        diagram: [
            { string: 5, fret: 2, finger: 1 },
            { string: 4, fret: 1, finger: 2 },
            { string: 3, fret: 2, finger: 3 },
            { string: 1, fret: 2, finger: 4 }
        ],
        muted: [6]
    },

    // =============================================
    // ACORDES DE PIANO - TODOS LOS TIPOS
    // =============================================
    {
        name: "C",
        type: "major",
        notes: ["C", "E", "G"],
        difficulty: "easy",
        instrument: "piano",
        pianoKeys: ["C4", "E4", "G4"],
        handPosition: {
            left: ["C3", "E3", "G3"],
            right: ["C4", "E4", "G4"]
        }
    },
    {
        name: "G",
        type: "major",
        notes: ["G", "B", "D"],
        difficulty: "easy",
        instrument: "piano",
        pianoKeys: ["G3", "B3", "D4"],
        handPosition: {
            left: ["G2", "B2", "D3"],
            right: ["G3", "B3", "D4"]
        }
    },
    {
        name: "D",
        type: "major",
        notes: ["D", "F#", "A"],
        difficulty: "medium",
        instrument: "piano",
        pianoKeys: ["D3", "F#3", "A3"],
        handPosition: {
            left: ["D2", "F#2", "A2"],
            right: ["D3", "F#3", "A3"]
        }
    },
    // ... (otros acordes mayores de piano)
    
    {
        name: "Am",
        type: "minor",
        notes: ["A", "C", "E"],
        difficulty: "easy",
        instrument: "piano",
        pianoKeys: ["A3", "C4", "E4"],
        handPosition: {
            left: ["A2", "C3", "E3"],
            right: ["A3", "C4", "E4"]
        }
    },
    // ... (otros acordes menores de piano)
    
    {
        name: "C7",
        type: "7",
        notes: ["C", "E", "G", "Bb"],
        difficulty: "medium",
        instrument: "piano",
        pianoKeys: ["C4", "E4", "G4", "Bb4"],
        handPosition: {
            left: ["C3", "E3", "G3", "Bb3"],
            right: ["C4", "E4", "G4", "Bb4"]
        }
    }
    // ... (otros tipos de acordes de piano)
];

// Función para dibujar el diagrama del acorde de guitarra
function drawGuitarChordDiagram(container, chord) {
    const fingerPositions = container.querySelector('.finger-positions');
    fingerPositions.innerHTML = '';

    // Dibujar puntos de los dedos
    chord.diagram.forEach(pos => {
        const dot = document.createElement('div');
        dot.className = 'finger-dot';

        // Calcular posición vertical (fret)
        let topPercent;
        if (pos.fret === 0) {
            topPercent = 0;
        } else if (pos.fret === 1) {
            topPercent = 15; // Justo debajo del nut
        } else {
            topPercent = 15 + (pos.fret - 1) * 25;
        }

        // Calcular posición horizontal (string)
        const leftPercent = (6 - pos.string) * (100 / 5);

        dot.style.left = `${leftPercent}%`;
        dot.style.top = `${topPercent}%`;
        dot.textContent = pos.finger || '';

        fingerPositions.appendChild(dot);

        // Dibujar barres si existen
        if (pos.barre) {
            const barre = document.createElement('div');
            barre.className = 'barre';

            const fromString = pos.barre.from;
            const toString = pos.barre.to;

            const leftPercent = (6 - fromString) * (100 / 5);
            const rightPercent = (6 - toString) * (100 / 5);

            barre.style.left = `${rightPercent}%`;
            barre.style.width = `${leftPercent - rightPercent}%`;
            barre.style.top = `${topPercent - 10}%`;

            fingerPositions.appendChild(barre);
        }
    });

    // Marcar cuerdas muteadas
    if (chord.muted) {
        chord.muted.forEach(string => {
            const muted = document.createElement('div');
            muted.className = 'muted-string';
            muted.innerHTML = '×';

            const leftPercent = (6 - string) * (100 / 5);
            muted.style.left = `${leftPercent}%`;

            fingerPositions.appendChild(muted);
        });
    }

    // Marcar cuerdas al aire
    if (chord.open) {
        chord.open.forEach(string => {
            const open = document.createElement('div');
            open.className = 'muted-string';
            open.innerHTML = '○';
            open.style.color = '#4CAF50';

            const leftPercent = (6 - string) * (100 / 5);
            open.style.left = `${leftPercent}%`;
            open.style.top = '-5px';

            fingerPositions.appendChild(open);
        });
    }
}

// Función para dibujar el diagrama del acorde de piano
function drawPianoChordDiagram(container, chord) {
    const pianoKeys = container.querySelector('.piano-keys');
    pianoKeys.innerHTML = '';

    // Crear teclado básico (2 octavas)
    const octave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let keyboard = [];
    
    // Generar 2 octavas
    for (let i = 3; i <= 4; i++) {
        octave.forEach(note => {
            keyboard.push({ note: note + i, isBlack: note.includes('#') });
        });
    }

    // Dibujar teclas
    keyboard.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.className = `piano-key ${key.isBlack ? 'black-key' : 'white-key'}`;
        keyElement.dataset.note = key.note;
        
        // Marcar si es parte del acorde
        if (chord.pianoKeys.includes(key.note)) {
            keyElement.classList.add('active');
            
            // Mostrar dedo recomendado (simplificado)
            if (chord.handPosition) {
                if (chord.handPosition.left.includes(key.note)) {
                    keyElement.innerHTML = '<span class="finger">L</span>';
                } else if (chord.handPosition.right.includes(key.note)) {
                    keyElement.innerHTML = '<span class="finger">R</span>';
                }
            }
        }
        
        pianoKeys.appendChild(keyElement);
    });
}

// Función para renderizar los acordes según el instrumento
function renderChords(instrument, filters = {}) {
    const gridId = instrument === 'guitar' ? 'chordsGrid' : 'pianoChordsGrid';
    const chordsGrid = document.getElementById(gridId);
    chordsGrid.innerHTML = '';

    const filteredChords = chordsData.filter(chord => {
        // Filtrar por instrumento
        if (chord.instrument !== instrument) return false;
        
        // Aplicar otros filtros
        if (filters.type && filters.type !== 'all' && chord.type !== filters.type) return false;
        if (filters.note && filters.note !== 'all') {
            const rootNote = chord.name.replace(/[^A-G#b]/g, '');
            if (filters.note.includes('/')) {
                const notes = filters.note.split('/');
                if (!notes.some(n => rootNote === n)) return false;
            } else if (rootNote !== filters.note) {
                return false;
            }
        }
        if (filters.difficulty && filters.difficulty !== 'all' && chord.difficulty !== filters.difficulty) return false;
        return true;
    });

    if (filteredChords.length === 0) {
        chordsGrid.innerHTML = '<div class="col-12 text-center py-4">No se encontraron acordes con los filtros seleccionados</div>';
        return;
    }

    const templateId = instrument === 'guitar' ? 'chordTemplate' : 'pianoChordTemplate';
    const template = document.getElementById(templateId);

    filteredChords.forEach(chord => {
        const clone = template.content.cloneNode(true);
        
        // Configurar información común
        clone.querySelector('.chord-name').textContent = chord.name;
        
        // Mostrar tipo de acorde
        let typeText = '';
        switch (chord.type) {
            case 'major': typeText = 'Mayor'; break;
            case 'minor': typeText = 'Menor'; break;
            case '7': typeText = 'Séptima'; break;
            case 'm7': typeText = 'Menor séptima'; break;
            case 'maj7': typeText = 'Mayor séptima'; break;
            case 'sus2': typeText = 'Sus2'; break;
            case 'sus4': typeText = 'Sus4'; break;
            case 'dim': typeText = 'Disminuido'; break;
            case 'aug': typeText = 'Aumentado'; break;
            default: typeText = chord.type;
        }
        clone.querySelector('.chord-type').textContent = typeText;
        
        // Mostrar notas del acorde
        clone.querySelector('.chord-notes').textContent = chord.notes.join(', ');

        // Botón para reproducir acorde
        const playButton = clone.querySelector('.play-chord');
        playButton.addEventListener('click', () => playChordSound(chord.notes));

        // Dibujar diagrama según instrumento
        if (instrument === 'guitar') {
            drawGuitarChordDiagram(clone, chord);
        } else {
            drawPianoChordDiagram(clone, chord);
        }

        chordsGrid.appendChild(clone);
    });
}

// Función para reproducir el sonido del acorde (simplificada)
function playChordSound(notes) {
    // En una implementación real, aquí usarías un sintetizador Web Audio API
    console.log("Reproduciendo acorde:", notes.join("-"));
    alert(`Reproduciendo acorde: ${notes.join("-")}`);
}

// Event listeners para los filtros de guitarra
document.getElementById('applyFilters')?.addEventListener('click', () => {
    const filters = {
        type: document.getElementById('chordTypeFilter').value,
        note: document.getElementById('noteFilter').value,
        difficulty: document.getElementById('difficultyFilter').value
    };
    renderChords('guitar', filters);
});

// Event listeners para las pestañas
document.getElementById('guitar-tab')?.addEventListener('click', () => {
    renderChords('guitar');
});

document.getElementById('piano-tab')?.addEventListener('click', () => {
    renderChords('piano');
});

// Inicializar con acordes de guitarra al cargar
document.addEventListener('DOMContentLoaded', () => {
    renderChords('guitar');
});