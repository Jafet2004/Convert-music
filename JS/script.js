function updateTonalityAndScale() {
    let saxophoneType = document.getElementById('saxophone').value;
    let originalTonality = document.getElementById('original-tonality').value;
    let convertedTonality = '';
    let scale = '';

    // Validar selecciones
    if (saxophoneType === 'seleccione' || originalTonality === 'seleccione') {
        document.getElementById('converted-tonality').textContent = '-';
        document.getElementById('sax-scale').textContent = '-';
        return;
    }

    if (saxophoneType === 'alto') {
        switch (originalTonality) {
            case 'C': convertedTonality = 'A'; scale = 'A, B, C#, D, E, F#, G#'; break;
            case 'C#': convertedTonality = 'A#'; scale = 'A#, B#, C##, D#, E#, F##, G##'; break;
            case 'D': convertedTonality = 'B'; scale = 'B, C#, D#, E, F#, G#, A#'; break;
            case 'D#': convertedTonality = 'C'; scale = 'C, D, E, F, G, A, B'; break;
            case 'E': convertedTonality = 'C#'; scale = 'C#, D#, E#, F#, G#, A#, B#'; break;
            case 'F': convertedTonality = 'D'; scale = 'D, E, F#, G, A, B, C#'; break;
            case 'F#': convertedTonality = 'D#'; scale = 'D#, E#, F##, G#, A#, B#, C##'; break;
            case 'G': convertedTonality = 'E'; scale = 'E, F#, G#, A, B, C#, D#'; break;
            case 'G#': convertedTonality = 'F'; scale = 'F, G, A, Bb, C, D, E'; break;
            case 'A': convertedTonality = 'F#'; scale = 'F#, G#, A#, B, C#, D#, E#'; break;
            case 'A#': convertedTonality = 'G'; scale = 'G, A, B, C, D, E, F#'; break;
            case 'B': convertedTonality = 'G#'; scale = 'G#, A#, B#, C#, D#, E#, F#'; break;
            default: convertedTonality = '-'; scale = '-'; break;
        }
    } else if (saxophoneType === 'soprano') {
        switch (originalTonality) {
            case 'C': convertedTonality = 'D'; scale = 'D, E, F#, G, A, B, C#'; break;
            case 'C#': convertedTonality = 'D#'; scale = 'D#, E#, F##, G#, A#, B#, C##'; break;
            case 'D': convertedTonality = 'E'; scale = 'E, F#, G#, A, B, C#, D#'; break;
            case 'D#': convertedTonality = 'F'; scale = 'F, G, A, Bb, C, D, E'; break;
            case 'E': convertedTonality = 'F#'; scale = 'F#, G#, A#, B, C#, D#, E#'; break;
            case 'F': convertedTonality = 'G'; scale = 'G, A, B, C, D, E, F#'; break;
            case 'F#': convertedTonality = 'G#'; scale = 'G#, A#, B#, C#, D#, E#, F#'; break;
            case 'G': convertedTonality = 'A'; scale = 'A, B, C#, D, E, F#, G#'; break;
            case 'G#': convertedTonality = 'A#'; scale = 'A#, B#, C##, D#, E#, F##, G##'; break;
            case 'A': convertedTonality = 'B'; scale = 'B, C#, D#, E, F#, G#, A#'; break;
            case 'A#': convertedTonality = 'C'; scale = 'C, D, E, F, G, A, B'; break;
            case 'B': convertedTonality = 'C#'; scale = 'C#, D#, E#, F#, G#, A#, B#'; break;
            default: convertedTonality = '-'; scale = '-'; break;
        }
    }

    document.getElementById('converted-tonality').textContent = convertedTonality;
    document.getElementById('sax-scale').textContent = scale;
}

function updateScale() {
    const tonality = document.getElementById('escala').value;
    const scaleType = document.getElementById('typeScale').value;

    if (tonality === 'seleccione' || scaleType === 'seleccione') {
        document.getElementById('scale-result').textContent = '-';
        return;
    }

    const scale = scales[scaleType]?.[tonality] || 'Escala no disponible';
    document.getElementById('scale-result').textContent = scale;
}

// Añadir event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saxophone').addEventListener('change', updateTonalityAndScale);
    document.getElementById('original-tonality').addEventListener('change', updateTonalityAndScale);
    document.getElementById('escala').addEventListener('change', updateScale);
    document.getElementById('typeScale').addEventListener('change', updateScale);
});

// Objeto scales permanece igual
const scales = {
    mayor: {
        'C': 'C, D, E, F, G, A, B, C',
        'C#': 'C#, D#, E#, F#, G#, A#, B#, C#',
        'D': 'D, E, F#, G, A, B, C#, D',
        'D#': 'Eb, F, G, Ab, Bb, C, D, Eb',
        'E': 'E, F#, G#, A, B, C#, D#, E',
        'F': 'F, G, A, Bb, C, D, E, F',
        'F#': 'F#, G#, A#, B, C#, D#, E#, F',
        'G': 'G, A, B, C, D, E, F#, G',
        'G#': 'G#, A#, B#, C#, D#, E#, G, G#',
        'A': 'A, B, C#, D, E, F#, G#, A',
        'Bb': 'Bb, C, D, Eb, F, G, A, Bb',
        'B': 'B, C#, D#, E, F#, G#, A#, B'
    },
    dorico: {
        'C': 'C, D, Eb, F, G, A, Bb, C',
        'C#': 'C#, D#, E, F#, G#, A#, B, C#',
        'D': 'D, E, F, G, A, B, C, D',
        'D#': 'D#, F, F#, G#, A#, C, C#, D#',
        'E': 'E, F#, G, A, B, C#, D, E',
        'F': 'F, G, Ab, Bb, C, D, Eb, F',
        'F#': 'F#, G#, A, B, C#, D#, E, F#',
        'G': 'G, A, Bb, C, D, E, F, G',
        'G#': 'G#, A#, B, C#, D#, F, F#, G#',
        'A': 'A, B, C, D, E, F#, G, A',
        'Bb': 'Bb, C, Db, Eb, F, G, Ab, Bb',
        'B': 'B, C#, D, E, F#, G#, A, B'
    },

    frigio: {
        'C': 'C, Db, Eb, F, G, Ab, Bb, C',
        'C#': 'C#, D, E, F#, G#, A, B, C#',
        'D': 'D, Eb, F, G, A, Bb, C, D',
        'D#': 'D#, E, F#, G#, A#, B, C#, D#',
        'E': 'E, F, G, A, B, C, D, E',
        'F': 'F, Gb, Ab, Bb, C, Db, Eb, F',
        'F#': 'F#, G, A, B, C#, D, E, F#',
        'G': 'G, Ab, Bb, C, D, Eb, F, G',
        'G#': 'G#, A, B, C#, D#, E, F#, G#',
        'A': 'A, Bb, C, D, E, F, G, A',
        'Bb': 'Bb, Cb, Db, Eb, F, Gb, Ab, Bb',
        'B': 'B, C, D, E, F#, G, A, B'
    },
    lidio: {
        'C': 'C, D, E, F#, G, A, B, C',
        'C#': 'C#, D#, E#, F##, G#, A#, B#, C#',
        'D': 'D, E, F#, G#, A, B, C#, D',
        'D#': 'D#, E#, F##, G##, A#, B#, C##, D#',
        'E': 'E, F#, G#, A#, B, C#, D#, E',
        'F': 'F, G, A, B, C, D, E, F',
        'F#': 'F#, G#, A#, B#, C#, D#, E#, F#',
        'G': 'G, A, B, C#, D, E, F#, G',
        'G#': 'G#, A#, B#, C##, D#, E#, F##, G#',
        'A': 'A, B, C#, D#, E, F#, G#, A',
        'Bb': 'Bb, C, D, E, F, G, A, Bb',
        'B': 'B, C#, D#, E#, F#, G#, A#, B'
    },
    mixolidio: {
        'C': 'C, D, E, F, G, A, Bb, C',
        'C#': 'C#, D#, E#, F#, G#, A#, B, C#',
        'D': 'D, E, F#, G, A, B, C, D',
        'D#': 'D#, E#, F##, G#, A#, B#, C#, D#',
        'E': 'E, F#, G#, A, B, C#, D, E',
        'F': 'F, G, A, Bb, C, D, Eb, F',
        'F#': 'F#, G#, A#, B, C#, D#, E, F#',
        'G': 'G, A, B, C, D, E, F, G',
        'G#': 'G#, A#, B#, C#, D#, E#, F#, G#',
        'A': 'A, B, C#, D, E, F#, G, A',
        'Bb': 'Bb, C, D, Eb, F, G, Ab, Bb',
        'B': 'B, C#, D#, E, F#, G#, A, B'
    },
    eolico: {
        'C': 'C, D, Eb, F, G, Ab, Bb, C',
        'C#': 'C#, D#, E, F#, G#, A, B, C#',
        'D': 'D, E, F, G, A, Bb, C, D',
        'D#': 'D#, E#, F#, G#, A#, B, C#, D#',
        'E': 'E, F#, G, A, B, C, D, E',
        'F': 'F, G, Ab, Bb, C, Db, Eb, F',
        'F#': 'F#, G#, A, B, C#, D, E, F#',
        'G': 'G, A, Bb, C, D, Eb, F, G',
        'G#': 'G#, A#, B, C#, D#, E, F#, G#',
        'A': 'A, B, C, D, E, F, G, A',
        'A#': 'A#, B#, C#, D#, E#, F#, G#, A#',
        'B': 'B, C#, D, E, F#, G, A, B'
    },
    locrio: {
        'C': 'C, Db, Eb, F, Gb, Ab, Bb, C',
        'C#': 'C#, D, E, F#, G, A, B, C#',
        'D': 'D, Eb, F, G, Ab, Bb, C, D',
        'D#': 'D#, E, F#, G#, A, B, C#, D#',
        'E': 'E, F, G, A, Bb, C, D, E',
        'F': 'F, Gb, Ab, Bb, Cb, Db, Eb, F',
        'F#': 'F#, G, A, B, C, D, E, F#',
        'G': 'G, Ab, Bb, C, Db, Eb, F, G',
        'G#': 'G#, A, B, C#, D, E, F#, G#',
        'A': 'A, Bb, C, D, Eb, F, G, A',
        'Bb': 'Bb, Cb, Db, Eb, Fb, Gb, Ab, Bb',
        'B': 'B, C, D, E, F, G, A, B'
    },
    mayor_pent: {
        'C': 'C, D, E, G, A',
        'C#': 'C#, D#, E#, G#, A#',
        'D': 'D, E, F#, A, B',
        'D#': 'D#, E#, F##, A#, B#',
        'E': 'E, F#, G#, B, C#',
        'F': 'F, G, A, C, D',
        'F#': 'F#, G#, A#, C#, D#',
        'G': 'G, A, B, D, E',
        'G#': 'G#, A#, B#, D#, E#',
        'A': 'A, B, C#, E, F#',
        'Bb': 'Bb, C, D, F, G',
        'B': 'B, C#, D#, F#, G#'
    },
    menor_pent: {
        'C': 'C, Eb, F, G, Bb',
        'C#': 'C#, E, F#, G#, B',
        'D': 'D, F, G, A, C',
        'D#': 'D#, F#, G#, A#, C#',
        'E': 'E, G, A, B, D',
        'F': 'F, Ab, Bb, C, Eb',
        'F#': 'F#, A, B, C#, E',
        'G': 'G, Bb, C, D, F',
        'G#': 'G#, B, C#, D#, F#',
        'A': 'A, C, D, E, G',
        'Bb': 'Bb, Db, Eb, F, Ab',
        'B': 'B, D, E, F#, A'
    }
};
