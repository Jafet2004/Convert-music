document.addEventListener('DOMContentLoaded', () => {
    ['guitar', 'violin', 'bass'].forEach(setupTuner);
});

function setupTuner(instrument) {
    // Elementos del DOM
    const elements = {
        startBtn: document.getElementById(`${instrument}-start`),
        stopBtn: document.getElementById(`${instrument}-stop`),
        noteDisplay: document.getElementById(`${instrument}-note`),
        freqDisplay: document.getElementById(`${instrument}-frequency`),
        needle: document.getElementById(`${instrument}-needle`),
        accuracyMarker: document.getElementById(`${instrument}-accuracy`),
        volumeLevel: document.getElementById(`${instrument}-volume`),
        statusDisplay: document.getElementById(`${instrument}-status`),
        strings: document.querySelectorAll(`#${instrument} .string`),
        permissionAlert: document.querySelector('.permission-alert')
    };

    // Estado del afinador
    const state = {
        isTuning: false,
        currentString: null,
        audioContext: null,
        analyser: null,
        microphone: null,
        scriptProcessor: null
    };

    // Configuración de notas musicales
    const notesConfig = {
        baseNotes: [
            { name: 'C', freq: 16.35 }, { name: 'C#', freq: 17.32 }, 
            { name: 'D', freq: 18.35 }, { name: 'D#', freq: 19.45 }, 
            { name: 'E', freq: 20.60 }, { name: 'F', freq: 21.83 }, 
            { name: 'F#', freq: 23.12 }, { name: 'G', freq: 24.50 }, 
            { name: 'G#', freq: 25.96 }, { name: 'A', freq: 27.50 }, 
            { name: 'A#', freq: 29.14 }, { name: 'B', freq: 30.87 }
        ],
        octaves: 8,
        getAllNotes() {
            const allNotes = [];
            for (let octave = 0; octave <= this.octaves; octave++) {
                this.baseNotes.forEach(note => {
                    allNotes.push({
                        name: note.name + octave,
                        freq: note.freq * Math.pow(2, octave)
                    });
                });
            }
            return allNotes;
        }
    };

    const allNotes = notesConfig.getAllNotes();

    // Inicialización de eventos
    elements.startBtn.addEventListener('click', startTuner);
    elements.stopBtn.addEventListener('click', stopTuner);
    elements.strings.forEach(string => {
        string.addEventListener('click', () => handleStringClick(string));
    });

    // --- Funciones principales ---

    async function startTuner() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            state.analyser = state.audioContext.createAnalyser();
            state.analyser.fftSize = 4096;
            state.microphone = state.audioContext.createMediaStreamSource(stream);
            state.microphone.connect(state.analyser);

            state.scriptProcessor = state.audioContext.createScriptProcessor(4096, 1, 1);
            state.analyser.connect(state.scriptProcessor);
            state.scriptProcessor.connect(state.audioContext.destination);

            state.scriptProcessor.onaudioprocess = processAudio;

            state.isTuning = true;
            toggleButtons(true);
            elements.statusDisplay.textContent = 'Selecciona una cuerda para comenzar a afinar';
            hidePermissionAlert();

            // Seleccionar automáticamente la primera cuerda
            if (elements.strings.length > 0) elements.strings[0].click();
        } catch (error) {
            handleAudioError(error);
        }
    }

    function stopTuner() {
        state.isTuning = false;
        toggleButtons(false);
        cleanupAudioResources();
        resetUI();
    }

    function handleStringClick(string) {
        if (!state.isTuning) return;
        elements.strings.forEach(s => s.classList.remove('active'));
        string.classList.add('active');
        state.currentString = {
            note: string.getAttribute('data-note'),
            targetFreq: parseFloat(string.getAttribute('data-frequency'))
        };
        elements.noteDisplay.textContent = state.currentString.note;
        elements.freqDisplay.textContent = `${state.currentString.targetFreq.toFixed(2)} Hz`;
        elements.statusDisplay.textContent = `Listo para afinar la cuerda ${state.currentString.note}`;
    }

    // --- Procesamiento de audio ---

    function processAudio() {
        if (!state.isTuning || !state.currentString) return;
        const bufferLength = state.analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);
        state.analyser.getFloatTimeDomainData(dataArray);

        updateVolumeLevel(dataArray);

        if (shouldProcessAudio(dataArray)) {
            const frequency = detectPitch(dataArray, state.audioContext.sampleRate);
            if (frequency) updateTunerDisplay(frequency);
        }
    }

    function updateVolumeLevel(dataArray) {
        const volume = calculateRMSVolume(dataArray);
        elements.volumeLevel.style.width = `${Math.min(volume * 100, 100)}%`;
    }

    function calculateRMSVolume(dataArray) {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        return Math.sqrt(sum / dataArray.length);
    }

    function shouldProcessAudio(dataArray) {
        return calculateRMSVolume(dataArray) > 0.01;
    }

    // --- Detección de tono (YIN simplificado) ---

    function detectPitch(buffer, sampleRate) {
        const yinBuffer = new Float32Array(buffer.length / 2);
        let minTau = 2, maxTau = yinBuffer.length - 1;
        let bestTau = -1, bestValue = 1;

        // Diferencia cuadrática
        for (let tau = minTau; tau < maxTau; tau++) {
            let sum = 0;
            for (let i = 0; i < yinBuffer.length; i++) {
                const delta = buffer[i] - buffer[i + tau];
                sum += delta * delta;
            }
            yinBuffer[tau] = sum;
        }

        // Normalización acumulativa
        let runningSum = 0;
        yinBuffer[0] = 1;
        for (let tau = 1; tau < maxTau; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        // Buscar mínimo
        for (let tau = minTau; tau < maxTau; tau++) {
            if (yinBuffer[tau] < bestValue) {
                bestValue = yinBuffer[tau];
                bestTau = tau;
            }
        }

        if (bestTau === -1 || bestValue > 0.1) return null;

        // Interpolación parabólica
        let betterTau = bestTau;
        if (bestTau > 1 && bestTau < maxTau - 1) {
            const s0 = yinBuffer[bestTau - 1];
            const s1 = yinBuffer[bestTau];
            const s2 = yinBuffer[bestTau + 1];
            betterTau = bestTau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        return sampleRate / betterTau;
    }

    // --- Actualización de la interfaz ---

    function updateTunerDisplay(frequency) {
        const closestNote = findClosestNote(frequency);
        if (!closestNote || !state.currentString) return;

        const targetNote = allNotes.find(n => n.name === state.currentString.note);
        if (!targetNote) return;

        const centsDiff = calculateCentsDifference(frequency, targetNote.freq);

        updateNoteDisplay(closestNote, frequency);
        updateNeedlePosition(centsDiff);
        updateAccuracyMarker(centsDiff);
        updateStatusMessage(centsDiff);
    }

    function findClosestNote(frequency) {
        return allNotes.reduce((prev, curr) =>
            Math.abs(curr.freq - frequency) < Math.abs(prev.freq - frequency) ? curr : prev
        );
    }

    function calculateCentsDifference(frequency, targetFrequency) {
        return 1200 * Math.log2(frequency / targetFrequency);
    }

    function updateNoteDisplay(note, frequency) {
        elements.noteDisplay.textContent = note.name;
        elements.freqDisplay.textContent = `${frequency.toFixed(2)} Hz`;
    }

    function updateNeedlePosition(centsDiff) {
        const maxAngle = 40; // px
        const angle = clamp(centsDiff, -50, 50) * (maxAngle / 50);
        elements.needle.style.transform = `translateX(-50%) translateX(${angle}px)`;
    }

    function updateAccuracyMarker(centsDiff) {
        const percent = 50 + clamp(centsDiff, -50, 50) * 0.5;
        elements.accuracyMarker.style.left = `${clamp(percent, 5, 95)}%`;

        // Cambiar color según precisión
        if (Math.abs(centsDiff) < 5) {
            elements.accuracyMarker.style.backgroundColor = 'var(--correct-color)';
            elements.noteDisplay.classList.add('correct-animation');
            setTimeout(() => elements.noteDisplay.classList.remove('correct-animation'), 500);
        } else if (Math.abs(centsDiff) < 20) {
            elements.accuracyMarker.style.backgroundColor = 'var(--close-color)';
            elements.noteDisplay.classList.remove('correct-animation');
        } else {
            elements.accuracyMarker.style.backgroundColor = 'var(--far-color)';
            elements.noteDisplay.classList.remove('correct-animation');
        }
    }

    function updateStatusMessage(centsDiff) {
        if (Math.abs(centsDiff) < 5) {
            elements.statusDisplay.textContent = `¡Perfecto! La cuerda ${state.currentString.note} está bien afinada`;
        } else if (Math.abs(centsDiff) < 20) {
            elements.statusDisplay.textContent = `Cerca. Ajusta la cuerda ${state.currentString.note} ${centsDiff > 0 ? 'bajando' : 'subiendo'} la tensión`;
        } else {
            elements.statusDisplay.textContent = `Afinando cuerda ${state.currentString.note}... ${centsDiff > 0 ? 'Baja' : 'Sube'} la tensión`;
        }
    }

    // --- Utilidades y limpieza ---

    function toggleButtons(starting) {
        elements.startBtn.disabled = starting;
        elements.stopBtn.disabled = !starting;
    }

    function hidePermissionAlert() {
        if (elements.permissionAlert) elements.permissionAlert.style.display = 'none';
    }

    function handleAudioError(error) {
        console.error('Error al acceder al micrófono:', error);
        elements.statusDisplay.textContent = 'Error: No se pudo acceder al micrófono';
        if (elements.permissionAlert) elements.permissionAlert.style.display = 'block';
        toggleButtons(false);
    }

    function cleanupAudioResources() {
        if (state.scriptProcessor) {
            state.scriptProcessor.disconnect();
            state.scriptProcessor.onaudioprocess = null;
            state.scriptProcessor = null;
        }
        if (state.microphone) {
            state.microphone.disconnect();
            if (state.microphone.mediaStream) {
                state.microphone.mediaStream.getTracks().forEach(track => track.stop());
            }
            state.microphone = null;
        }
        if (state.audioContext) {
            state.audioContext.close();
            state.audioContext = null;
        }
    }

    function resetUI() {
        elements.needle.style.transform = 'translateX(-50%)';
        elements.accuracyMarker.style.left = '50%';
        elements.accuracyMarker.style.backgroundColor = '';
        elements.noteDisplay.textContent = '--';
        elements.freqDisplay.textContent = '0 Hz';
        elements.volumeLevel.style.width = '0%';
        elements.statusDisplay.textContent = 'Presiona "Iniciar" para comenzar a afinar';
        elements.strings.forEach(s => s.classList.remove('active'));
        state.currentString = null;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}