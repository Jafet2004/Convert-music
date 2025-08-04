document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const toggleBtn = document.getElementById('toggle-metronome');
    const metronomeIcon = document.getElementById('metronome-icon');
    const metronomeText = document.getElementById('metronome-text');
    const bpmDisplay = document.getElementById('current-bpm');
    const bpmSlider = document.getElementById('bpm-slider');
    const decreaseBpm = document.getElementById('decrease-bpm');
    const increaseBpm = document.getElementById('increase-bpm');
    const beatIndicator = document.getElementById('beat-indicator');
    const timeSignatureBtns = document.querySelectorAll('.btn-signature');
    const accentBeatCheck = document.getElementById('accent-beat');
    const visualModeCheck = document.getElementById('visual-mode');
    
    // Variables del metrónomo
    let isPlaying = false;
    let bpm = 120;
    let beatsPerMeasure = 4;
    let currentBeat = 0;
    let timer = null;
    let audioContext;
    let tickSound, tockSound;
    let tapTimes = [];
    let isTapActive = false;
    
    // Inicializar audio con mejores sonidos
    function initAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Sonido Tick mejorado
        const createSound = (freq, type) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = 0;
            return {oscillator: osc, gain: gain};
        };
        
        tickSound = createSound(800, 'square');
        tockSound = createSound(1200, 'sine');
        
        tickSound.oscillator.start();
        tockSound.oscillator.start();
    }
    
    // Reproducir sonido con mejor calidad
    function playSound(sound) {
        const now = audioContext.currentTime;
        sound.gain.gain.cancelScheduledValues(now);
        sound.gain.gain.setValueAtTime(0.5, now);
        sound.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    }
    
    // Función de tempo táctil
    function handleTapTempo() {
        const now = Date.now();
        tapTimes.push(now);
        
        if (tapTimes.length > 2) {
            tapTimes.shift();
        }
        
        if (tapTimes.length > 1) {
            const averageBpm = Math.round(60000 / ((tapTimes[1] - tapTimes[0]) / 2));
            updateBpm(Math.max(40, Math.min(240, averageBpm)));
        }
        
        // Feedback visual
        beatIndicator.classList.add('tap-active');
        setTimeout(() => {
            beatIndicator.classList.remove('tap-active');
        }, 200);
    }
    
    // Actualizar BPM con validación
    function updateBpm(newBpm) {
        bpm = Math.max(40, Math.min(240, newBpm));
        bpmDisplay.textContent = bpm;
        bpmSlider.value = bpm;
        
        if (isPlaying) {
            restartMetronome();
        }
    }
    
    // Reiniciar metrónomo manteniendo el estado
    function restartMetronome() {
        stop();
        start();
    }
    
    // Cambiar compás
    function changeTimeSignature(beats) {
        beatsPerMeasure = beats;
        timeSignatureBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.beats) === beats);
        });
        currentBeat = 0; // Reset al cambiar compás
    }
    
    // Tiempo del metrónomo mejorado
    function metronomeTick() {
        currentBeat = currentBeat % beatsPerMeasure + 1;
        
        // Sonido
        if (currentBeat === 1 && accentBeatCheck.checked) {
            playSound(tockSound);
        } else {
            playSound(tickSound);
        }
        
        // Visualización
        if (visualModeCheck.checked) {
            updateVisualIndicator();
        }
    }
    
    // Actualizar indicador visual con mejor animación
    function updateVisualIndicator() {
        beatIndicator.textContent = currentBeat;
        beatIndicator.classList.remove('active', 'accent', 'metronome-pulse');
        
        if (currentBeat === 1 && accentBeatCheck.checked) {
            beatIndicator.classList.add('accent');
        } else {
            beatIndicator.classList.add('active');
        }
        
        beatIndicator.classList.add('metronome-pulse');
    }
    
    // Iniciar metrónomo con comprobación de audio
    function start() {
        if (!audioContext) {
            initAudio();
        }
        
        const interval = 60000 / bpm;
        timer = setInterval(metronomeTick, interval);
        isPlaying = true;
        updateUIForPlaying();
    }
    
    // Detener metrónomo
    function stop() {
        clearInterval(timer);
        isPlaying = false;
        currentBeat = 0;
        updateUIForStopped();
    }
    
    // Actualizar UI cuando está reproduciendo
    function updateUIForPlaying() {
        metronomeIcon.classList.replace('fa-play', 'fa-stop');
        metronomeText.textContent = 'Detener';
        toggleBtn.classList.add('playing');
    }
    
    // Actualizar UI cuando está detenido
    function updateUIForStopped() {
        metronomeIcon.classList.replace('fa-stop', 'fa-play');
        metronomeText.textContent = 'Iniciar';
        toggleBtn.classList.remove('playing');
        beatIndicator.textContent = '';
        beatIndicator.classList.remove('active', 'accent');
    }
    
    // Event listeners mejorados
    toggleBtn.addEventListener('click', toggleMetronome);
    bpmSlider.addEventListener('input', () => updateBpm(parseInt(bpmSlider.value)));
    decreaseBpm.addEventListener('click', () => updateBpm(bpm - 1));
    increaseBpm.addEventListener('click', () => updateBpm(bpm + 1));
    beatIndicator.addEventListener('dblclick', handleTapTempo);
    
    timeSignatureBtns.forEach(btn => {
        btn.addEventListener('click', () => changeTimeSignature(parseInt(btn.dataset.beats)));
    });
    
    // Función para alternar metrónomo
    function toggleMetronome() {
        if (isPlaying) {
            stop();
        } else {
            start();
        }
    }
    
    // Teclado shortcuts mejorados
    document.addEventListener('keydown', function(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                toggleMetronome();
                break;
            case 'ArrowUp':
                updateBpm(bpm + (e.shiftKey ? 10 : 1));
                break;
            case 'ArrowDown':
                updateBpm(bpm - (e.shiftKey ? 10 : 1));
                break;
            case 'KeyT':
                handleTapTempo();
                break;
        }
    });
    
    // Presets de BPM comunes
    const bpmPresets = {
        'Lento': 60,
        'Adagio': 72,
        'Moderato': 108,
        'Allegro': 132,
        'Presto': 180
    };
    
    // Cargar configuración guardada si existe
    function loadSettings() {
        const savedBpm = localStorage.getItem('metronomeBpm');
        if (savedBpm) updateBpm(parseInt(savedBpm));
        
        const savedSignature = localStorage.getItem('metronomeSignature');
        if (savedSignature) changeTimeSignature(parseInt(savedSignature));
    }
    
    // Guardar configuración
    function saveSettings() {
        localStorage.setItem('metronomeBpm', bpm);
        localStorage.setItem('metronomeSignature', beatsPerMeasure);
    }
    
    // Inicializar
    loadSettings();
    window.addEventListener('beforeunload', saveSettings);
});