// Configuración mejorada de teoría musical
const MUSIC_THEORY = {
    chromaticScale: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    enharmonicEquivalents: {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
        'D♭': 'C#', 'E♭': 'D#', 'G♭': 'F#', 'A♭': 'G#', 'B♭': 'A#',
        'Cb': 'B', 'E#': 'F', 'Fb': 'E', 'B#': 'C'
    },
    
    // Escalas mayor y eólica (menor natural) mejoradas
    scales: {
        mayor: {
            'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
            'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
            'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
            'D#': ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##'],
            'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
            'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
            'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
            'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
            'G#': ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##'],
            'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
            'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
            'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']
        },
        eolico: {
            'A': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            'A#': ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G#'],
            'B': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
            'C': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
            'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
            'D': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
            'D#': ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'],
            'E': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
            'F': ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],
            'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
            'G': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
            'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#']
        },
        // Escala menor armónica para detectar la sensible
        armonica: {
            'A': ['A', 'B', 'C', 'D', 'E', 'F', 'G#'],
            'C': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'],
            'D': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C#'],
            'E': ['E', 'F#', 'G', 'A', 'B', 'C', 'D#'],
            'G': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#']
        }
    },

    // Acordes para todas las tonalidades mayores y menores con pesos mejorados
    keySignatures: {
        // Tonalidades mayores
        'C': { 
            chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Am'
        },
        'G': { 
            chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Em'
        },
        'D': { 
            chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Bm'
        },
        'A': { 
            chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'F#m'
        },
        'E': { 
            chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'C#m'
        },
        'B': { 
            chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'G#m'
        },
        'F': { 
            chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Dm'
        },
        'Bb': { 
            chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Gm'
        },
        'Eb': { 
            chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Cm'
        },
        'Ab': { 
            chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Fm'
        },
        'Db': { 
            chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Bbm'
        },
        'Gb': { 
            chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'Ebm'
        },
        'F#': { 
            chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], 
            weights: [0.35, 0.15, 0.1, 0.25, 0.3, 0.1, 0.05],
            mode: 'mayor',
            relativeMinor: 'D#m'
        },
        
        // Tonalidades menores (eólicas)
        'Am': { 
            chords: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'C'
        },
        'Em': { 
            chords: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'G'
        },
        'Bm': { 
            chords: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'D'
        },
        'F#m': { 
            chords: ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'A'
        },
        'C#m': { 
            chords: ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'E'
        },
        'G#m': { 
            chords: ['G#m', 'A#dim', 'B', 'C#m', 'D#m', 'E', 'F#'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'B'
        },
        'Dm': { 
            chords: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'F'
        },
        'Gm': { 
            chords: ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'Bb'
        },
        'Cm': { 
            chords: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'Eb'
        },
        'Fm': { 
            chords: ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'Ab'
        },
        'Bbm': { 
            chords: ['Bbm', 'Cdim', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'Db'
        },
        'Ebm': { 
            chords: ['Ebm', 'Fdim', 'Gb', 'Abm', 'Bbm', 'Cb', 'Db'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'Gb'
        },
        'D#m': { 
            chords: ['D#m', 'E#dim', 'F#', 'G#m', 'A#m', 'B', 'C#'], 
            weights: [0.35, 0.05, 0.25, 0.15, 0.1, 0.15, 0.15],
            mode: 'eolico',
            relativeMajor: 'F#'
        }
    },

    // Relación entre acordes y escalas mejorada
    chordScaleMap: {
        'maj': 'mayor',
        'min': 'eolico',
        'dim': 'eolico',
        'maj7': 'mayor',
        'min7': 'eolico',
        '7': 'mayor',
        'm7b5': 'eolico',
        'sus2': 'mayor',
        'sus4': 'mayor',
        'aug': 'mayor',
        'dim7': 'eolico'
    },

    // Progresiones comunes con pesos
    commonProgressions: {
        'I-IV-V': { chords: [0, 3, 4], weight: 1.5 },
        'I-V-vi-IV': { chords: [0, 4, 5, 3], weight: 1.3 },
        'ii-V-I': { chords: [1, 4, 0], weight: 1.4 },
        'i-iv-V': { chords: [0, 3, 4], weight: 1.5 }, // Menor
        'i-VI-III-VII': { chords: [0, 5, 2, 6], weight: 1.2 } // Menor
    }
};

class AdvancedMusicTransposer {
    constructor() {
        this.currentSteps = 0;
        this.MAX_STEPS = 4;
        this.currentMode = 'mayor';
    }

    normalizeNote(note) {
        if (!note) return null;
        note = note.toUpperCase().replace(/♭/g, 'b');
        return MUSIC_THEORY.enharmonicEquivalents[note] || note;
    }

    getChordRoot(chord) {
        if (!chord || typeof chord !== 'string') return null;
        // Manejar acordes menores (m, min, -)
        const match = chord.match(/^([A-Ga-g](?:#|b|♭)?)(m(?:in|aj)?|[-+]?)(.*)$/i);
        return match ? this.normalizeNote(match[1]) : null;
    }

    getChordType(chord) {
        if (!chord) return null;
        const match = chord.match(/^[A-Ga-g](?:#|b|♭)?(.*)$/i);
        if (!match) return 'maj'; // Por defecto mayor
        
        const type = match[1].toLowerCase();
        if (type.includes('dim') || type.includes('°')) return 'dim';
        if (type.includes('min') || type.includes('m') || type === '') return 'min';
        if (type.includes('maj')) return 'maj';
        if (type.includes('aug')) return 'aug';
        if (type.includes('sus')) return 'sus';
        if (type === '7') return '7';
        
        return 'maj'; // Por defecto mayor
    }

    parseMelodyString(input) {
        if (!input) return { chords: [], melodyNotes: [] };
        
        const elements = input.split(/[,;\s|]+/).filter(el => el.trim());
        const chords = [];
        const melodyNotes = [];
        
        elements.forEach(el => {
            el = el.trim();
            if (this.getChordRoot(el)) {
                chords.push(el);
            } else if (this.normalizeNote(el) && 
                      MUSIC_THEORY.chromaticScale.includes(this.normalizeNote(el))) {
                melodyNotes.push(this.normalizeNote(el));
            }
        });
        
        return { chords, melodyNotes };
    }

    transposeElement(element, steps) {
        if (!element || typeof element !== 'string') return element;
        
        const root = this.getChordRoot(element) || this.normalizeNote(element);
        if (!root) return element;
        
        const modifiers = element.replace(/^[A-Ga-g](?:#|b|♭)?/i, '');
        const currentIndex = MUSIC_THEORY.chromaticScale.indexOf(root);
        if (currentIndex === -1) return element;
        
        const newIndex = (currentIndex + steps + 12) % 12;
        return MUSIC_THEORY.chromaticScale[newIndex] + modifiers;
    }

    estimateKey(chords, melodyNotes = []) {
        if (chords.length === 0 && melodyNotes.length === 0) {
            return { key: 'No determinado', mode: 'desconocido', confidence: 0 };
        }

        let bestKey = 'No determinado';
        let maxScore = 0;
        let detectedMode = 'mayor';
        let confidence = 0;
        let relativeKey = null;

        // Primero, analizamos los acordes
        const chordAnalysis = this.analyzeChords(chords);
        
        // Luego, analizamos las notas de la melodía
        const melodyAnalysis = this.analyzeMelody(melodyNotes);
        
        // Combinamos los resultados
        for (const key in MUSIC_THEORY.keySignatures) {
            const keyInfo = MUSIC_THEORY.keySignatures[key];
            let score = 0;
            
            // Puntuación por acordes
            if (chordAnalysis[key]) {
                score += chordAnalysis[key].score * 1.5; // Peso mayor para acordes
                
                // Bonus por progresiones comunes
                if (chordAnalysis[key].commonProgression) {
                    score += 0.5;
                }
            }
            
            // Puntuación por melodía
            if (melodyAnalysis[keyInfo.mode] && melodyAnalysis[keyInfo.mode][key]) {
                score += melodyAnalysis[keyInfo.mode][key] * 0.8; // Peso menor para melodía
            }
            
            // Bonus por acorde final (tónica)
            if (chords.length > 0) {
                const lastChordRoot = this.getChordRoot(chords[chords.length - 1]);
                const tonic = this.getChordRoot(key.replace('m', ''));
                
                if (lastChordRoot === tonic) {
                    score *= 1.3;
                }
            }
            
            // Bonus por acorde inicial (tónica)
            if (chords.length > 0) {
                const firstChordRoot = this.getChordRoot(chords[0]);
                const tonic = this.getChordRoot(key.replace('m', ''));
                
                if (firstChordRoot === tonic) {
                    score *= 1.2;
                }
            }
            
            // Determinar modo basado en la tercera
            if (melodyNotes.length > 0) {
                const thirdIndex = keyInfo.mode === 'mayor' ? 2 : 2; // Índice de la tercera en la escala
                const scale = MUSIC_THEORY.scales[keyInfo.mode][key.replace('m', '')];
                if (scale) {
                    const third = scale[thirdIndex];
                    const thirdCount = melodyNotes.filter(n => n === third).length;
                    
                    if (keyInfo.mode === 'mayor' && thirdCount > 0) {
                        score += thirdCount * 0.1;
                    } else if (keyInfo.mode === 'eolico' && thirdCount > 0) {
                        score += thirdCount * 0.1;
                    }
                }
            }
            
            // Detección de sensible en modo menor
            if (keyInfo.mode === 'eolico' && MUSIC_THEORY.scales.armonica[key]) {
                const leadingTone = MUSIC_THEORY.scales.armonica[key][6]; // 7mo grado elevado
                if (melodyNotes.includes(leadingTone) || 
                    chords.some(c => this.getChordRoot(c) === leadingTone)) {
                    score *= 1.2;
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                bestKey = key;
                detectedMode = keyInfo.mode;
                relativeKey = keyInfo.mode === 'mayor' ? keyInfo.relativeMinor : keyInfo.relativeMajor;
            }
        }
        
        // Calcular confianza (0-100%)
        const totalPossible = (chords.length * 0.5) + (melodyNotes.length * 0.3) + 1.5; // Máximo aproximado
        confidence = Math.min(100, Math.round((maxScore / totalPossible) * 100));
        
        // Si hay empate, preferir mayor sobre menor
        if (confidence < 60) {
            // Verificar si podría ser el relativo
            for (const key in MUSIC_THEORY.keySignatures) {
                if (MUSIC_THEORY.keySignatures[key].relativeMajor === bestKey || 
                    MUSIC_THEORY.keySignatures[key].relativeMinor === bestKey) {
                    const relativeScore = chordAnalysis[key]?.score || 0;
                    if (relativeScore > maxScore * 0.8) {
                        bestKey = key;
                        detectedMode = MUSIC_THEORY.keySignatures[key].mode;
                        confidence = Math.min(100, Math.round((relativeScore / totalPossible) * 100));
                        break;
                    }
                }
            }
        }
        
        return {
            key: maxScore > 0.5 ? bestKey : 'No determinado',
            mode: detectedMode,
            confidence,
            relativeKey
        };
    }
    
    analyzeChords(chords) {
        const analysis = {};
        
        // Contar ocurrencias de cada acorde
        const chordCounts = {};
        chords.forEach(chord => {
            const root = this.getChordRoot(chord);
            if (root) {
                chordCounts[root] = (chordCounts[root] || 0) + 1;
            }
        });
        
        // Analizar cada tonalidad posible
        for (const key in MUSIC_THEORY.keySignatures) {
            const keyInfo = MUSIC_THEORY.keySignatures[key];
            let score = 0;
            let matchedChords = 0;
            const progressionMatches = {};
            
            // Verificar cada acorde en la tonalidad
            keyInfo.chords.forEach((chord, index) => {
                const root = this.getChordRoot(chord);
                const count = chordCounts[root] || 0;
                
                // Peso base por acorde en la tonalidad
                score += count * keyInfo.weights[index];
                
                if (count > 0) {
                    matchedChords++;
                }
            });
            
            // Bonus por cantidad de acordes coincidentes
            if (matchedChords > 0) {
                score += matchedChords * 0.1;
            }
            
            // Detectar progresiones comunes
            for (const progName in MUSIC_THEORY.commonProgressions) {
                const progression = MUSIC_THEORY.commonProgressions[progName];
                let matches = 0;
                
                for (let i = 0; i <= chords.length - progression.chords.length; i++) {
                    let sequenceMatch = true;
                    
                    for (let j = 0; j < progression.chords.length; j++) {
                        const expectedChord = keyInfo.chords[progression.chords[j]];
                        const actualChord = chords[i + j];
                        
                        if (!actualChord || this.getChordRoot(actualChord) !== this.getChordRoot(expectedChord)) {
                            sequenceMatch = false;
                            break;
                        }
                    }
                    
                    if (sequenceMatch) {
                        matches++;
                    }
                }
                
                if (matches > 0) {
                    progressionMatches[progName] = matches;
                    score += matches * progression.weight;
                }
            }
            
            if (score > 0) {
                analysis[key] = {
                    score,
                    matchedChords,
                    progressionMatches: Object.keys(progressionMatches).length > 0 ? progressionMatches : null
                };
            }
        }
        
        return analysis;
    }
    
    analyzeMelody(melodyNotes) {
        const analysis = {
            mayor: {},
            eolico: {}
        };
        
        if (melodyNotes.length === 0) return analysis;
        
        // Contar ocurrencias de cada nota
        const noteCounts = {};
        melodyNotes.forEach(note => {
            noteCounts[note] = (noteCounts[note] || 0) + 1;
        });
        
        // Analizar para cada modo y tonalidad
        for (const mode in MUSIC_THEORY.scales) {
            for (const key in MUSIC_THEORY.scales[mode]) {
                const scale = MUSIC_THEORY.scales[mode][key];
                let score = 0;
                let matchedNotes = 0;
                
                // Puntos por notas en la escala
                scale.forEach(note => {
                    if (noteCounts[note]) {
                        score += noteCounts[note] * 0.2; // Peso menor para notas melódicas
                        matchedNotes += noteCounts[note];
                    }
                });
                
                // Bonus por tónica, tercera y quinta
                if (scale[0] && noteCounts[scale[0]]) { // Tónica
                    score += noteCounts[scale[0]] * 0.3;
                }
                if (scale[2] && noteCounts[scale[2]]) { // Tercera
                    score += noteCounts[scale[2]] * 0.25;
                }
                if (scale[4] && noteCounts[scale[4]]) { // Quinta
                    score += noteCounts[scale[4]] * 0.2;
                }
                
                // Penalización por notas fuera de la escala
                const totalNotes = melodyNotes.length;
                const outsideNotes = totalNotes - matchedNotes;
                score -= outsideNotes * 0.15;
                
                if (score > 0) {
                    analysis[mode][key] = score;
                }
            }
        }
        
        return analysis;
    }

    transpose(input, steps) {
        if (Math.abs(this.currentSteps + steps) > this.MAX_STEPS) {
            throw new Error(`Límite de transposición: ±${this.MAX_STEPS} semitonos (2 tonos)`);
        }
        
        const { chords, melodyNotes } = this.parseMelodyString(input);
        const originalKeyInfo = this.estimateKey(chords, melodyNotes);
        
        this.currentMode = originalKeyInfo.mode;
        const transposedChords = chords.map(chord => this.transposeElement(chord, steps));
        const transposedMelody = melodyNotes.map(note => this.transposeElement(note, steps));
        
        this.currentSteps += steps;
        
        // Re-estimar la tonalidad después de transponer
        const transposedKeyInfo = this.estimateKey(transposedChords, transposedMelody);
        
        // Corregir la tonalidad transponiendo la original correctamente
        const originalKeyRoot = this.getChordRoot(originalKeyInfo.key.replace('m', ''));
        if (originalKeyRoot) {
            const originalKeyIndex = MUSIC_THEORY.chromaticScale.indexOf(originalKeyRoot);
            const newKeyIndex = (originalKeyIndex + steps + 12) % 12;
            const newKeyBase = MUSIC_THEORY.chromaticScale[newKeyIndex];
            
            // Mantener el modo (mayor o menor)
            let correctedKey;
            if (originalKeyInfo.key.endsWith('m')) {
                correctedKey = newKeyBase + 'm';
                
                // Verificar equivalencia enarmónica para tonalidades menores
                const enharmonic = Object.entries(MUSIC_THEORY.enharmonicEquivalents)
                    .find(([k, v]) => v === newKeyBase);
                if (enharmonic && enharmonic[0].endsWith('b')) {
                    correctedKey = enharmonic[0] + 'm';
                }
            } else {
                correctedKey = newKeyBase;
                
                // Verificar equivalencia enarmónica para tonalidades mayores
                const enharmonic = Object.entries(MUSIC_THEORY.enharmonicEquivalents)
                    .find(([k, v]) => v === newKeyBase);
                if (enharmonic && enharmonic[0].endsWith('b')) {
                    correctedKey = enharmonic[0];
                }
            }
            
            // Verificar si la tonalidad corregida existe en nuestras firmas
            if (MUSIC_THEORY.keySignatures[correctedKey]) {
                transposedKeyInfo.key = correctedKey;
                transposedKeyInfo.mode = originalKeyInfo.mode;
            }
        }
        
        return {
            original: { 
                chords, 
                melodyNotes, 
                key: originalKeyInfo.key,
                mode: originalKeyInfo.mode,
                confidence: originalKeyInfo.confidence,
                relativeKey: originalKeyInfo.relativeKey
            },
            transposed: { 
                chords: transposedChords, 
                melodyNotes: transposedMelody,
                key: transposedKeyInfo.key,
                mode: transposedKeyInfo.mode,
                confidence: transposedKeyInfo.confidence,
                relativeKey: transposedKeyInfo.relativeKey
            },
            currentSteps: this.currentSteps
        };
    }

    reset() {
        this.currentSteps = 0;
        this.currentMode = 'mayor';
    }
}

// Interfaz de usuario mejorada con información de tonalidad
class EnhancedTransposerUI {
    constructor() {
        this.transposer = new AdvancedMusicTransposer();
        this.initElements();
        this.bindEvents();
        this.updateUI();
    }
    
    initElements() {
        this.elements = {
            input: document.getElementById('melody-input'),
            originalMelody: document.getElementById('original-melody'),
            transposedMelody: document.getElementById('transposed-melody'),
            currentSteps: document.getElementById('current-steps'),
            estimatedKey: document.getElementById('estimated-key'),
            newKey: document.getElementById('new-key'),
            estimatedMode: document.getElementById('estimated-mode'),
            transposedMode: document.getElementById('transposed-mode'),
            transposeButtons: document.querySelectorAll('.transpose-btn'),
            resetButton: document.getElementById('reset-btn')
        };
        
        // Verificar que todos los elementos existen
        for (const key in this.elements) {
            if (!this.elements[key]) {
                console.warn(`Elemento no encontrado: ${key}`);
            }
        }
    }
    
    bindEvents() {
        // Manejar botones de transposición
        this.elements.transposeButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTranspose(parseInt(btn.getAttribute('data-steps'), 10));
            });
        });
        
        // Actualización en tiempo real al escribir
        let inputTimeout;
        this.elements.input?.addEventListener('input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                this.transposer.reset();
                this.updateUI();
            }, 300);
        });
        
        // Botón de reinicio
        this.elements.resetButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleReset();
        });
    }
    
    handleTranspose(steps) {
        try {
            const input = this.elements.input?.value.trim();
            if (!input) return;
            
            const result = this.transposer.transpose(input, steps);
            this.displayResults(result);
        } catch (error) {
            console.error("Error en transposición:", error);
            // No mostrar alertas para mejor experiencia de usuario
        }
    }
    
    displayResults(result) {
        if (!result) return;
        
        const { original, transposed, currentSteps } = result;
        
        // Actualizar elementos solo si existen
        if (this.elements.originalMelody) {
            this.elements.originalMelody.textContent = this.formatMelodyDisplay(original);
        }
        if (this.elements.transposedMelody) {
            this.elements.transposedMelody.textContent = this.formatMelodyDisplay(transposed);
        }
        if (this.elements.currentSteps) {
            this.elements.currentSteps.textContent = 
                `${currentSteps > 0 ? '+' : ''}${currentSteps} semitono${Math.abs(currentSteps) !== 1 ? 's' : ''}`;
        }
        if (this.elements.estimatedKey) {
            this.elements.estimatedKey.textContent = original.key;
        }
        if (this.elements.newKey) {
            this.elements.newKey.textContent = transposed.key;
        }
        if (this.elements.estimatedMode) {
            this.elements.estimatedMode.textContent = original.mode === 'mayor' ? 'Mayor' : 'Menor';
        }
        if (this.elements.transposedMode) {
            this.elements.transposedMode.textContent = transposed.mode === 'mayor' ? 'Mayor' : 'Menor';
        }
    }
    
    formatMelodyDisplay({ chords, melodyNotes }) {
        if (!chords && !melodyNotes) return '-';
        
        let display = chords?.join(', ') || '';
        if (melodyNotes?.length > 0) {
            display += (display ? ' | ' : '') + `Melodía: ${melodyNotes.join(' ')}`;
        }
        return display || '-';
    }
    
    handleReset() {
        this.transposer.reset();
        if (this.elements.input) {
            this.elements.input.value = '';
        }
        this.updateUI();
    }
    
    updateUI() {
        const input = this.elements.input?.value.trim();
        
        if (!input) {
            this.clearDisplay();
            return;
        }
        
        try {
            const { chords, melodyNotes } = this.transposer.parseMelodyString(input);
            const { key, mode } = this.transposer.estimateKey(chords, melodyNotes);
            
            // Actualizar solo elementos existentes
            if (this.elements.originalMelody) {
                this.elements.originalMelody.textContent = this.formatMelodyDisplay({ chords, melodyNotes });
            }
            if (this.elements.transposedMelody) {
                this.elements.transposedMelody.textContent = this.formatMelodyDisplay({ chords, melodyNotes });
            }
            if (this.elements.currentSteps) {
                this.elements.currentSteps.textContent = '0 semitonos';
            }
            if (this.elements.estimatedKey) {
                this.elements.estimatedKey.textContent = key;
            }
            if (this.elements.newKey) {
                this.elements.newKey.textContent = key;
            }
            if (this.elements.estimatedMode) {
                this.elements.estimatedMode.textContent = mode === 'mayor' ? 'Mayor' : 'Menor';
            }
            if (this.elements.transposedMode) {
                this.elements.transposedMode.textContent = mode === 'mayor' ? 'Mayor' : 'Menor';
            }
        } catch (error) {
            console.error("Error al actualizar UI:", error);
            this.clearDisplay();
        }
    }
    
    clearDisplay() {
        // Limpiar solo elementos existentes
        if (this.elements.originalMelody) {
            this.elements.originalMelody.textContent = '-';
        }
        if (this.elements.transposedMelody) {
            this.elements.transposedMelody.textContent = '-';
        }
        if (this.elements.currentSteps) {
            this.elements.currentSteps.textContent = '0 semitonos';
        }
        if (this.elements.estimatedKey) {
            this.elements.estimatedKey.textContent = '-';
        }
        if (this.elements.newKey) {
            this.elements.newKey.textContent = '-';
        }
        if (this.elements.estimatedMode) {
            this.elements.estimatedMode.textContent = '-';
        }
        if (this.elements.transposedMode) {
            this.elements.transposedMode.textContent = '-';
        }
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        new EnhancedTransposerUI();
    } catch (error) {
        console.error("Error al inicializar el transpositor:", error);
    }
});