function updateTonalityAndScale() {
    let saxophoneType = document.getElementById('saxophone').value;
    let originalTonality = document.getElementById('original-tonality').value;
    let convertedTonality = '';
    let scale = '';

    if (saxophoneType === 'alto') {
        switch (originalTonality) {
            case 'C': convertedTonality = 'A'; scale = 'A, B, C#, D, E, F#, G#'; break;
            case 'D': convertedTonality = 'B'; scale = 'B, C#, D#, E, F#, G#, A#'; break;
            case 'E': convertedTonality = 'C#'; scale = 'C#, D#, E#, F#, G#, A#, B#'; break;
            case 'F': convertedTonality = 'D'; scale = 'D, E, F#, G, A, B, C#'; break;
            case 'G': convertedTonality = 'E'; scale = 'E, F#, G#, A, B, C#, D#'; break;
            case 'A': convertedTonality = 'F#'; scale = 'F#, G#, A#, B, C#, D#, E#'; break;
            case 'B': convertedTonality = 'G#'; scale = 'G#, A#, B#, C#, D#, E#, F#'; break;
            default: convertedTonality = ''; scale = ''; break;
        }
    } else if (saxophoneType === 'soprano') {
        switch (originalTonality) {
            case 'C': convertedTonality = 'D'; scale = 'D, E, F#, G, A, B, C#'; break;
            case 'D': convertedTonality = 'E'; scale = 'E, F#, G#, A, B, C#, D#'; break;
            case 'E': convertedTonality = 'F#'; scale = 'F#, G#, A#, B, C#, D#, E#'; break;
            case 'F': convertedTonality = 'G#'; scale = 'G#, A#, B#, C#, D#, E#, F#'; break;
            case 'G': convertedTonality = 'A'; scale = 'A, B, C#, D, E, F#, G#'; break;
            case 'A': convertedTonality = 'B'; scale = 'B, C#, D#, E, F#, G#, A#'; break;
            case 'B': convertedTonality = 'C#'; scale = 'C#, D#, E#, F#, G#, A#, B#'; break;
            default: convertedTonality = ''; scale = ''; break;
        }
    }

    document.getElementById('converted-tonality').textContent = convertedTonality;
    document.getElementById('scale').textContent = scale;

    // Activar la animación de aparición
    let resultDiv = document.getElementById('result');
    resultDiv.style.opacity = 1;
}

// Agregar eventos a ambos selectores
document.getElementById('original-tonality').addEventListener('change', updateTonalityAndScale);
document.getElementById('saxophone').addEventListener('change', updateTonalityAndScale);