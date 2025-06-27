document.addEventListener('DOMContentLoaded', function() {
    // Modo oscuro (sin cambios)
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeIcon.classList.replace('fa-moon', 'fa-sun');
        darkModeText.textContent = 'Modo Claro';
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeIcon.classList.replace('fa-moon', 'fa-sun');
            darkModeText.textContent = 'Modo Claro';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeIcon.classList.replace('fa-sun', 'fa-moon');
            darkModeText.textContent = 'Modo Oscuro';
        }
    });
    
    // Configuración del afinador para cada instrumento
    setupTuner('guitar');
    setupTuner('violin');
    setupTuner('bass');
    
    function setupTuner(instrument) {
        const startBtn = document.getElementById(`${instrument}-start`);
        const stopBtn = document.getElementById(`${instrument}-stop`);
        const noteDisplay = document.getElementById(`${instrument}-note`);
        const freqDisplay = document.getElementById(`${instrument}-frequency`);
        const needle = document.getElementById(`${instrument}-needle`);
        const accuracyMarker = document.getElementById(`${instrument}-accuracy`);
        const volumeLevel = document.getElementById(`${instrument}-volume`);
        const statusDisplay = document.getElementById(`${instrument}-status`);
        const strings = document.querySelectorAll(`#${instrument} .string`);
        const permissionAlert = document.querySelector('.permission-alert');
        
        let isTuning = false;
        let currentString = null;
        let audioContext = null;
        let analyser = null;
        let microphone = null;
        let scriptProcessor = null;
        let animationId = null;
        
        // Notas musicales y sus frecuencias (para detección)
        const notes = [
            { name: 'C', freq: 16.35 },
            { name: 'C#', freq: 17.32 },
            { name: 'D', freq: 18.35 },
            { name: 'D#', freq: 19.45 },
            { name: 'E', freq: 20.60 },
            { name: 'F', freq: 21.83 },
            { name: 'F#', freq: 23.12 },
            { name: 'G', freq: 24.50 },
            { name: 'G#', freq: 25.96 },
            { name: 'A', freq: 27.50 },
            { name: 'A#', freq: 29.14 },
            { name: 'B', freq: 30.87 }
        ];
        
        // Extender las notas a varias octavas
        const allNotes = [];
        for (let octave = 0; octave <= 8; octave++) {
            notes.forEach(note => {
                allNotes.push({
                    name: note.name + octave,
                    freq: note.freq * Math.pow(2, octave)
                });
            });
        }
        
        // Seleccionar cuerda
        strings.forEach(string => {
            string.addEventListener('click', function() {
                if (!isTuning) return;
                
                strings.forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                
                currentString = {
                    note: this.getAttribute('data-note'),
                    targetFreq: parseFloat(this.getAttribute('data-frequency'))
                };
                
                noteDisplay.textContent = currentString.note;
                freqDisplay.textContent = `${currentString.targetFreq.toFixed(2)} Hz`;
                statusDisplay.textContent = `Listo para afinar la cuerda ${currentString.note}`;
            });
        });
        
        // Iniciar afinador
        startBtn.addEventListener('click', async function() {
            try {
                // Solicitar permiso de micrófono
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true });
                
                // Configurar AudioContext
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 4096; // Aumentamos el tamaño para mejor precisión
                
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                
                // Configurar ScriptProcessor para análisis en tiempo real
                scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);
                
                isTuning = true;
                startBtn.disabled = true;
                stopBtn.disabled = false;
                statusDisplay.textContent = 'Selecciona una cuerda para comenzar a afinar';
                
                // Ocultar alerta de permiso si está visible
                if (permissionAlert.style.display === 'block') {
                    permissionAlert.style.display = 'none';
                }
                
                // Iniciar análisis de audio
                scriptProcessor.onaudioprocess = function() {
                    if (!isTuning) return;
                    
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Float32Array(bufferLength);
                    analyser.getFloatTimeDomainData(dataArray); // Usamos Float32Array para mejor precisión
                    
                    // Calcular volumen
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += Math.abs(dataArray[i]);
                    }
                    const rms = Math.sqrt(sum / bufferLength);
                    const volume = Math.min(rms * 10, 1);
                    
                    // Actualizar indicador de volumen
                    const volumePercent = volume * 100;
                    volumeLevel.style.width = `${volumePercent}%`;
                    
                    // Solo procesar si hay suficiente volumen
                    if (volume > 0.01 && currentString) {
                        const frequency = detectPitch(dataArray, audioContext.sampleRate);
                        if (frequency) {
                            updateTunerDisplay(frequency);
                        }
                    }
                };
                
                // Seleccionar automáticamente la primera cuerda
                if (strings.length > 0) {
                    strings[0].click();
                }
            } catch (error) {
                console.error('Error al acceder al micrófono:', error);
                statusDisplay.textContent = 'Error: No se pudo acceder al micrófono';
                permissionAlert.style.display = 'block';
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }
        });
        
        // Detener afinador
        stopBtn.addEventListener('click', function() {
            isTuning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            
            if (scriptProcessor) {
                scriptProcessor.disconnect();
                scriptProcessor.onaudioprocess = null;
            }
            
            if (microphone) {
                microphone.disconnect();
                microphone.mediaStream.getTracks().forEach(track => track.stop());
            }
            
            if (audioContext) {
                audioContext.close();
            }
            
            cancelAnimationFrame(animationId);
            needle.style.transform = 'translateX(-50%)';
            accuracyMarker.style.left = '50%';
            accuracyMarker.style.backgroundColor = '';
            noteDisplay.textContent = '--';
            freqDisplay.textContent = '0 Hz';
            volumeLevel.style.width = '0%';
            statusDisplay.textContent = 'Presiona "Iniciar" para comenzar a afinar';
            
            strings.forEach(s => s.classList.remove('active'));
            currentString = null;
        });
        
        // Función mejorada para detectar el tono (pitch)
        function detectPitch(buffer, sampleRate) {
            // Implementación basada en YIN algorithm (simplificada)
            const yinBuffer = new Float32Array(buffer.length / 2);
            
            // Paso 1: Calcular diferencia
            for (let tau = 0; tau < yinBuffer.length; tau++) {
                yinBuffer[tau] = 0;
                for (let j = 0; j < yinBuffer.length; j++) {
                    const delta = buffer[j] - buffer[j + tau];
                    yinBuffer[tau] += delta * delta;
                }
            }
            
            // Paso 2: Normalización acumulativa
            yinBuffer[0] = 1;
            let sum = 0;
            for (let tau = 1; tau < yinBuffer.length; tau++) {
                sum += yinBuffer[tau];
                yinBuffer[tau] *= tau / sum;
            }
            
            // Paso 3: Encontrar el mínimo
            let tau = 2;
            while (tau < yinBuffer.length && yinBuffer[tau] > yinBuffer[tau + 1]) {
                tau++;
            }
            
            if (tau === yinBuffer.length || yinBuffer[tau] >= 0.1) {
                return null; // No se detectó un tono claro
            }
            
            // Paso 4: Interpolación parabólica para mayor precisión
            let betterTau = tau;
            if (tau > 1 && tau < yinBuffer.length - 1) {
                const s0 = yinBuffer[tau - 1];
                const s1 = yinBuffer[tau];
                const s2 = yinBuffer[tau + 1];
                betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            }
            
            return sampleRate / betterTau;
        }
        
        // Función para actualizar la interfaz con la frecuencia detectada
        function updateTunerDisplay(frequency) {
            // Encontrar la nota más cercana
            let closestNote = null;
            let minDiff = Infinity;
            
            allNotes.forEach(note => {
                const diff = Math.abs(note.freq - frequency);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestNote = note;
                }
            });
            
            // Calcular diferencia en cents (100 cents = 1 semitono)
            let centsDiff = 0;
            if (closestNote && frequency > 0) {
                centsDiff = 1200 * Math.log2(frequency / closestNote.freq);
            }
            
            // Actualizar UI si hay una cuerda seleccionada
            if (currentString && closestNote) {
                // Calcular diferencia con la cuerda seleccionada
                const targetNote = allNotes.find(n => n.name === currentString.note);
                if (targetNote) {
                    const targetCentsDiff = 1200 * Math.log2(frequency / targetNote.freq);
                    
                    // Actualizar displays
                    requestAnimationFrame(() => {
                        noteDisplay.textContent = closestNote.name;
                        freqDisplay.textContent = `${frequency.toFixed(2)} Hz`;
                        
                        // Mover aguja
                        const needlePosition = 50 + (targetCentsDiff / 50 * 25);
                        needle.style.transform = `translateX(-50%) translateX(${Math.min(Math.max(needlePosition - 50, -40), 40)}px)`;
                        
                        // Mover marcador de precisión
                        const accuracyPosition = 50 + (targetCentsDiff / 50 * 25);
                        accuracyMarker.style.left = `${Math.min(Math.max(accuracyPosition, 5), 95)}%`;
                        
                        // Cambiar color según precisión
                        if (Math.abs(targetCentsDiff) < 5) {
                            accuracyMarker.style.backgroundColor = 'var(--correct-color)';
                            statusDisplay.textContent = `Perfecto! La cuerda ${currentString.note} está bien afinada`;
                            noteDisplay.classList.add('correct-animation');
                            setTimeout(() => noteDisplay.classList.remove('correct-animation'), 500);
                        } else if (Math.abs(targetCentsDiff) < 20) {
                            accuracyMarker.style.backgroundColor = 'var(--close-color)';
                            statusDisplay.textContent = `Cerca! Ajusta la cuerda ${currentString.note} ${targetCentsDiff > 0 ? 'bajando' : 'subiendo'} la tensión`;
                            noteDisplay.classList.remove('correct-animation');
                        } else {
                            accuracyMarker.style.backgroundColor = 'var(--far-color)';
                            statusDisplay.textContent = `Afinando cuerda ${currentString.note}... ${targetCentsDiff > 0 ? 'Baja' : 'Sube'} la tensión`;
                            noteDisplay.classList.remove('correct-animation');
                        }
                    });
                }
            }
        }
    }
});