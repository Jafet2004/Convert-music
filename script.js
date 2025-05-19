function updateTonalityAndScale() {
    let saxophoneType = document.getElementById('saxophone').value;
    let originalTonality = document.getElementById('original-tonality').value;
    let convertedTonality = '';
    let scale = '';

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
            default: convertedTonality = ''; scale = ''; break;
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
            default: convertedTonality = ''; scale = ''; break;
        }
    }

    document.getElementById('converted-tonality').textContent = convertedTonality;
    document.getElementById('sax-scale').textContent = scale;

    // Activar la animación de aparición
    let resultDiv = document.getElementById('result');
    resultDiv.style.opacity = 1;
}

// Objeto con las escalas mayores y menores
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
    menor: {
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
    }
};

function searchScale() {
    let selectedScale = document.getElementById('escala').value;
    let scaleType = document.getElementById('typeScale').value;
    let result = '';
    
    if (selectedScale !== 'seleccione' && scaleType !== 'seleccione') {
        result = scales[scaleType][selectedScale];
    }
    
    document.getElementById('scale-result').textContent = result;
    
    // Activar la animación de aparición
    let resultScaleDiv = document.getElementById('result_Scale');
    resultScaleDiv.style.opacity = 1;
}

// Agregar eventos
document.getElementById('original-tonality').addEventListener('change', updateTonalityAndScale);
document.getElementById('saxophone').addEventListener('change', updateTonalityAndScale);
document.getElementById('escala').addEventListener('change', searchScale);
document.getElementById('typeScale').addEventListener('change', searchScale);
