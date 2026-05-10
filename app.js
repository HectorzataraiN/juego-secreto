let numeroSecreto = 0;
let intentos = 0;
let listaNumerosSorteados = [];
let numeroMaximo = 10;
let intentosUsuario = [];

function asignarTextoElemento(elemento, texto) {
    let elementoHTML = document.querySelector(elemento);
    elementoHTML.innerHTML = texto;
    return;
}

function actualizarTextoDificultad() {
    asignarTextoElemento(
        '.texto__parrafo',
        `Indica un número del 1 al ${numeroMaximo}`
    );
}

const selectorDificultad = document.getElementById('dificultad');

function verificarIntento() {
    let numeroDeUsuario = parseInt(document.getElementById('valorUsuario').value);

    intentosUsuario.push(numeroDeUsuario);

    asignarTextoElemento(
        '.texto__intentos',
        `Tus números: ${intentosUsuario.join(', ')}`
    );

    if (numeroDeUsuario === numeroSecreto) {
        sonidos.victoria();
        lanzarConfeti();
        asignarTextoElemento(
            '.texto__parrafo',
            `¡Acertaste el número en ${intentos} ${(intentos === 1) ? 'vez' : 'veces'}! 🎉`
        );
        document.getElementById('reiniciar').removeAttribute('disabled');
    } else {
        if (Math.abs(numeroDeUsuario - numeroSecreto) <= 3) {
            sonidos.acierto(); // cerca del número
        } else {
            sonidos.fallo(); // lejos del número
        }
        if (numeroDeUsuario > numeroSecreto) {
            asignarTextoElemento('.texto__parrafo', 'El número secreto es menor');
        } else {
            asignarTextoElemento('.texto__parrafo', 'El número secreto es mayor');
        }
        intentos++;
        limpiarCaja();
    }
    return;
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
    asignarTextoElemento('.texto__intentos', '');
    asignarTextoElemento('h1', 'Juego del número secreto!');
    actualizarTextoDificultad();
    numeroSecreto = generarNumeroSecreto();
    intentos = 1;
}

function reiniciarJuego() {
    limpiarCaja();
    condicionesIniciales();
    document.querySelector('#reiniciar').setAttribute('disabled', 'true');
}

function lanzarConfeti() {
    const duracion = 3000;
    const fin = Date.now() + duracion;
    const colores = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'];

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: colores });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colores });
        if (Date.now() < fin) requestAnimationFrame(frame);
    })();
}

// Soporte para tecla Enter
document.getElementById('valorUsuario').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') verificarIntento();
});

condicionesIniciales();

selectorDificultad.addEventListener('change', () => {
    numeroMaximo = parseInt(selectorDificultad.value);
    document.getElementById('valorUsuario').setAttribute('max', numeroMaximo);
    listaNumerosSorteados = [];
    condicionesIniciales();
});
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
        // Toca tres notas en secuencia: do - mi - sol
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