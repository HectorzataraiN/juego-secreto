let numeroSecreto = 0;
let intentos = 0;
let listaNumerosSorteados = [];
let numeroMaximo = 10;
let intentosUsuario = [];
let rachaVictorias = 0;

const limiteIntentos = {
    10:  3,  // Fácil
    50:  6,  // Media
    100: 9   // Difícil
};

function asignarTextoElemento(elemento, texto) {
    let elementoHTML = document.querySelector(elemento);
    elementoHTML.innerHTML = texto;
    return;
}

function actualizarTextoDificultad() {
    const limite = limiteIntentos[numeroMaximo];
    asignarTextoElemento(
        '.texto__parrafo',
        `Indica un número del 1 al ${numeroMaximo}. Tienes ${limite} intentos.`
    );
}

const selectorDificultad = document.getElementById('dificultad');

function verificarIntento() {
    const limite = limiteIntentos[numeroMaximo];
    let numeroDeUsuario = parseInt(document.getElementById('valorUsuario').value);

    // Validar que el input no esté vacío o fuera de rango
    if (isNaN(numeroDeUsuario) || numeroDeUsuario < 1 || numeroDeUsuario > numeroMaximo) {
        asignarTextoElemento('.texto__parrafo', `Ingresa un número válido entre 1 y ${numeroMaximo}`);
        return;
    }

    intentosUsuario.push(numeroDeUsuario);
    asignarTextoElemento(
        '.texto__intentos',
        `Tus números: ${intentosUsuario.join(', ')} (${intentos} de ${limite})`
    );

    if (numeroDeUsuario === numeroSecreto) {
        actualizarRacha(true);
        sonidos.victoria();
        lanzarConfeti();
        asignarTextoElemento(
            '.texto__parrafo',
            `¡Acertaste el número en ${intentos} ${(intentos === 1) ? 'vez' : 'veces'}! 🎉`
        );
        document.getElementById('reiniciar').removeAttribute('disabled');
        document.getElementById('valorUsuario').setAttribute('disabled', 'true');
        document.querySelector('.chute .container__boton').setAttribute('disabled', 'true'); // ← nuevo
    } else if (intentos >= limite) {
        // Se acabaron los intentos
        actualizarRacha(false);
        sonidos.fallo();
        asignarTextoElemento(
            '.texto__parrafo',
            `¡Sin intentos! El número era ${numeroSecreto} 😞`
        );
        document.getElementById('reiniciar').removeAttribute('disabled');
        document.getElementById('valorUsuario').setAttribute('disabled', 'true');
        document.querySelector('.chute .container__boton').setAttribute('disabled', 'true'); // ← nuevo

    } else {
        if (Math.abs(numeroDeUsuario - numeroSecreto) <= 3) {
            sonidos.acierto();
        } else {
            sonidos.fallo();
        }

        if (numeroDeUsuario > numeroSecreto) {
            asignarTextoElemento('.texto__parrafo', `El número secreto es menor — te quedan ${limite - intentos} intentos`);
        } else {
            asignarTextoElemento('.texto__parrafo', `El número secreto es mayor — te quedan ${limite - intentos} intentos`);
        }

        intentos++;
        limpiarCaja();
    }
}

function limpiarCaja() {
    document.querySelector('#valorUsuario').value = '';
}

function generarNumeroSecreto() {
    let numeroGenerado = Math.floor(Math.random() * numeroMaximo) + 1;

    if (listaNumerosSorteados.length == numeroMaximo) {
        asignarTextoElemento('.texto__parrafo', 'Ya se sortearon todos los números posibles');
    } else {
        if (listaNumerosSorteados.includes(numeroGenerado)) {
            return generarNumeroSecreto();
        } else {
            listaNumerosSorteados.push(numeroGenerado);
            return numeroGenerado;
        }
    }
}

function condicionesIniciales() {
    intentosUsuario = [];
    intentos = 1;

    asignarTextoElemento('.texto__intentos', '');
    asignarTextoElemento('h1', 'Juego del número secreto!');
    actualizarTextoDificultad();

    numeroSecreto = generarNumeroSecreto();

    // Re-habilitar input por si quedó deshabilitado
    document.getElementById('valorUsuario').removeAttribute('disabled');

    console.log(numeroSecreto);
}

function reiniciarJuego() {
    limpiarCaja();
    condicionesIniciales();
    document.querySelector('#reiniciar').setAttribute('disabled', 'true');
}

function actualizarRacha(gano) {
    if (gano) {
        rachaVictorias++;
    } else {
        rachaVictorias = 0;
    }

    const rachaEl = document.getElementById('racha');
    const rachaTexto = document.getElementById('racha__texto');

    if (rachaVictorias === 0) {
        rachaEl.style.display = 'none';
        return;
    }

    let mensaje;
    if      (rachaVictorias === 1) mensaje = `🔥 Racha: 1`;
    else if (rachaVictorias === 2) mensaje = `🔥🔥 Racha: 2 ¡Vas bien!`;
    else if (rachaVictorias === 3) mensaje = `🔥🔥🔥 Racha: 3 ¡En llamas!`;
    else                           mensaje = `🔥 Racha: ${rachaVictorias} ¡Imparable!`;

    rachaTexto.textContent = mensaje;
    rachaEl.style.display = 'block';

    // Re-dispara animación de pulso
    rachaEl.style.animation = 'none';
    rachaEl.offsetHeight;
    rachaEl.style.animation = 'pulso 0.4s ease';
}

const sonidos = {
    fallo: () => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    },

    acierto: () => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    },

    victoria: () => {
        const ctx = new AudioContext();
        const notas = [523, 659, 784];
        notas.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            const t = ctx.currentTime + i * 0.18;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    }
};

function lanzarConfeti() {
    const duracion = 3000;
    const fin = Date.now() + duracion;
    const colores = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'];

    (function frame() {
        confetti({ particleCount: 5, angle: 60,  spread: 55, origin: { x: 0 }, colors: colores });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colores });
        if (Date.now() < fin) requestAnimationFrame(frame);
    })();
}

// Soporte para tecla Enter
document.getElementById('valorUsuario').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') verificarIntento();
});

condicionesIniciales();

selectorDificultad.addEventListener('change', () => {
    numeroMaximo = parseInt(selectorDificultad.value);
    document.getElementById('valorUsuario').setAttribute('max', numeroMaximo);
    listaNumerosSorteados = [];
    condicionesIniciales();
});