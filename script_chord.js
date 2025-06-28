// Datos de acordes con diagramas completos
const chordsData = [
    // =============================================
    // ACORDES MAYORES
    // =============================================
    {
        name: "C",
        type: "major",
        notes: ["C", "E", "G"],
        difficulty: "easy",
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
        diagram: [
            { string: 6, fret: 3, finger: 2 },
            { string: 5, fret: 2, finger: 1 },
            { string: 1, fret: 3, finger: 4 }
        ],
        open: [4, 3, 2]
    },
    {
        name: "D",
        type: "major",
        notes: ["D", "F#", "A"],
        difficulty: "medium",
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
        diagram: [
            { string: 5, fret: 2, finger: 1 },
            { string: 4, fret: 4, finger: 4 },
            { string: 3, fret: 4, finger: 3 },
            { string: 2, fret: 4, finger: 2 }
        ],
        muted: [6]
    },

    // =============================================
    // ACORDES MENORES
    // =============================================
    {
        name: "Am",
        type: "minor",
        notes: ["A", "C", "E"],
        difficulty: "easy",
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
        diagram: [
            { string: 5, fret: 2, finger: 1, barre: { from: 1, to: 5 } },
            { string: 4, fret: 4, finger: 4 },
            { string: 3, fret: 4, finger: 3 },
            { string: 2, fret: 3, finger: 2 }
        ],
        muted: [6]
    }, {
        name: "F#m",
        type: "minor",
        notes: ["F#", "A", "C#"],
        difficulty: "hard",
        diagram: [
            { string: 6, fret: 2, finger: 1, barre: { from: 1, to: 6 } },
            { string: 5, fret: 4, finger: 3 },
            { string: 4, fret: 4, finger: 4 }
        ]
    },

    // =============================================
    // ACORDES CON SOSTENIDOS/BEMOLES
    // =============================================
    {
        name: "C#",
        type: "major",
        notes: ["C#", "F", "G#"],
        difficulty: "hard",
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
        diagram: [
            { string: 5, fret: 4, finger: 1 },
            { string: 4, fret: 1, finger: 2 },
            { string: 3, fret: 2, finger: 3 },
            { string: 2, fret: 2, finger: 4 }
        ],
        muted: [6, 1]
    },

    // =============================================
    // ACORDES DE SÉPTIMA
    // =============================================
    {
        name: "C7",
        type: "7",
        notes: ["C", "E", "G", "Bb"],
        difficulty: "medium",
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
        diagram: [
            { string: 6, fret: 3, finger: 2 },
            { string: 5, fret: 2, finger: 1 },
            { string: 3, fret: 3, finger: 4 }
        ],
        open: [4, 2, 1]
    },
    {
        name: "D7",
        type: "7",
        notes: ["D", "F#", "A", "C"],
        difficulty: "medium",
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
        diagram: [
            { string: 5, fret: 2, finger: 1 },
            { string: 4, fret: 1, finger: 2 },
            { string: 3, fret: 2, finger: 3 },
            { string: 1, fret: 2, finger: 4 }
        ],
        muted: [6]
    },

    // =============================================
    // ACORDES DE SÉPTIMA MENOR
    // =============================================
    {
        name: "Am7",
        type: "m7",
        notes: ["A", "C", "E", "G"],
        difficulty: "easy",
        diagram: [
            { string: 4, fret: 2, finger: 1 },
            { string: 2, fret: 1, finger: 2 }
        ],
        open: [5, 3, 1]
    },
    {
        name: "Em7",
        type: "m7",
        notes: ["E", "G", "B", "D"],
        difficulty: "easy",
        diagram: [
            { string: 5, fret: 2, finger: 2 }
        ],
        open: [6, 4, 3, 2, 1]
    },
    {
        name: "Dm7",
        type: "m7",
        notes: ["D", "F", "A", "C"],
        difficulty: "medium",
        diagram: [
            { string: 3, fret: 2, finger: 1 },
            { string: 2, fret: 1, finger: 2 },
            { string: 1, fret: 1, finger: 3 }
        ],
        open: [4]
    },

    // =============================================
    // ACORDES SUSPENDIDOS
    // =============================================
    {
        name: "Asus2",
        type: "sus2",
        notes: ["A", "B", "E"],
        difficulty: "easy",
        diagram: [
            { string: 4, fret: 2, finger: 1 },
            { string: 3, fret: 2, finger: 2 }
        ],
        open: [5, 2, 1]
    },
    {
        name: "Dsus4",
        type: "sus4",
        notes: ["D", "G", "A"],
        difficulty: "medium",
        diagram: [
            { string: 3, fret: 2, finger: 1 },
            { string: 1, fret: 3, finger: 3 },
            { string: 2, fret: 3, finger: 2 }
        ],
        muted: [6, 5],
        open: [4]
    },
    {
        name: "Esus4",
        type: "sus4",
        notes: ["E", "A", "B"],
        difficulty: "easy",
        diagram: [
            { string: 5, fret: 2, finger: 2 },
            { string: 4, fret: 2, finger: 3 }
        ],
        open: [6, 3, 2, 1]
    }
];

// Función para dibujar el diagrama del acorde
function drawChordDiagram(container, chord) {
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

// Función para renderizar los acordes
function renderChords(filters = {}) {
    const chordsGrid = document.getElementById('chordsGrid');
    chordsGrid.innerHTML = '';

    const filteredChords = chordsData.filter(chord => {
        // Aplicar filtros
        if (filters.type && filters.type !== 'all' && chord.type !== filters.type) return false;
        if (filters.note && filters.note !== 'all') {
            const rootNote = chord.name.replace(/[^A-G#b]/g, '');
            if (filters.note.includes('/')) {
                // Para notas como C#/Db
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

    const template = document.getElementById('chordTemplate');

    filteredChords.forEach(chord => {
        const clone = template.content.cloneNode(true);
        const chordCard = clone.querySelector('.chord-card');

        // Configurar la información del acorde
        clone.querySelector('.chord-name').textContent = chord.name;

        // Mostrar el tipo de acorde con formato
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

        // Mostrar las notas del acorde
        clone.querySelector('.chord-notes').textContent = chord.notes.join(' - ');

        // Dibujar el diagrama del acorde
        drawChordDiagram(clone, chord);

        chordsGrid.appendChild(clone);
    });
}

// Event listeners para los filtros
document.getElementById('applyFilters').addEventListener('click', () => {
    const filters = {
        type: document.getElementById('chordTypeFilter').value,
        note: document.getElementById('noteFilter').value,
        difficulty: document.getElementById('difficultyFilter').value
    };
    renderChords(filters);
});

// Renderizar todos los acordes cuando se abre el acordeón
document.getElementById('chordsCollapse').addEventListener('shown.bs.collapse', () => {
    renderChords();
});