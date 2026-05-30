/**
 * OXIA — app.js
 * Architecture : StorageEngine | AudioEngine | StarfieldRenderer
 *                BreathingEngine | UIEngine | App
 *
 * Cible : iOS Safari PWA (iPhone 17 Pro)
 * Hébergement : GitHub Pages
 */
'use strict';

/* ================================================================
   1. PROTOCOLS — Données et configuration des 6 protocoles
   ================================================================ */

const PROTOCOLS = {
  physiological_sigh: {
    id: 'physiological_sigh',
    name: 'Soupir Physiologique',
    icon: '🤍',
    summary: 'Calme immédiat. Réduit l\'anxiété en moins de 30 secondes.',
    info: {
      goal: 'Calme immédiat, réduction de l\'anxiété et de la pression. Récupération rapide après un pic de stress.',
      origin: 'Identifié dans les années 1930, formalisé par le Dr Jack Feldman (UCLA) et popularisé par le neurobiologiste Andrew Huberman (Stanford).',
      science: 'Extrêmement élevée. La double inspiration regonfle les alvéoles pulmonaires affaissées, maximisant l\'élimination du CO₂. C\'est le mécanisme autonome le plus rapide pour faire baisser la fréquence cardiaque.'
    },
    stopCondition: 'cycle', // 'cycle' | 'timer' | 'round'
    totalCycles: 3,
    totalTime: null,
    hasWimHofLevel: false,
    getPhases(X) {
      return [
        { text: 'Inspirez profondément par le nez', duration: X, type: 'inhale' },
        { text: 'Micro-inspiration rapide — bloquez au max', duration: 1, type: 'hold' },
        { text: 'Expirez longuement et relâchez par la bouche', duration: X * 2, type: 'exhale' },
      ];
    }
  },

  cardiac_coherence: {
    id: 'cardiac_coherence',
    name: 'Cohérence Cardiaque',
    icon: '🪷',
    summary: 'Régule le stress chronique. Effets bénéfiques jusqu\'à 4h après.',
    info: {
      goal: 'Routine quotidienne pour réguler le stress chronique, améliorer la digestion et optimiser la Variabilité de la Fréquence Cardiaque (VFC).',
      origin: 'Basée sur les recherches de l\'Institut HeartMath (USA), popularisée en Europe par le Dr David Servan-Schreiber et le Dr Charly Cungi.',
      science: 'Incontestable. Respirer à 6 cycles/min crée une résonance à 0,1 Hz équilibrant parfaitement les systèmes orthosympathique et parasympathique. Les effets sur le cortisol durent environ 4 heures.'
    },
    stopCondition: 'timer',
    totalCycles: null,
    totalTime: 300, // 5 min
    hasWimHofLevel: false,
    getPhases() {
      return [
        { text: 'Inspirez par le nez en gonflant le ventre', duration: 5, type: 'inhale' },
        { text: 'Expirez par la bouche lentement', duration: 5, type: 'exhale' },
      ];
    }
  },

  wim_hof: {
    id: 'wim_hof',
    name: 'Méthode Wim Hof',
    icon: '🔋',
    summary: 'Boost d\'énergie et immunité. Récupération musculaire.',
    info: {
      goal: 'Boost d\'énergie et immunité. Idéal le matin, pour tolérer le froid ou stimuler la récupération musculaire via l\'hormèse (stress positif).',
      origin: 'Créée par Wim Hof (« L\'Homme de Glace »), inspirée du Yoga Tummo tibétain ancestral.',
      science: 'Validée cliniquement (Université Radboud, 2014). Active volontairement le système nerveux sympathique, libérant de l\'adrénaline et induisant une baisse temporaire de la réponse inflammatoire.'
    },
    stopCondition: 'round', // 3 grands rounds
    totalCycles: 3,
    totalTime: null,
    hasWimHofLevel: true,
    getPhases: null // Généré dynamiquement par BreathingEngine
  },

  four_seven_eight: {
    id: 'four_seven_eight',
    name: 'Méthode 4-7-8',
    icon: '🌙',
    summary: 'Endormissement profond. Stimule le nerf vague pour un effet sédatif.',
    info: {
      goal: 'Endormissement et relaxation profonde. Parfait contre l\'insomnie ou pour calmer les pensées d\'un esprit qui s\'emballe le soir.',
      origin: 'Conçue par le Dr Andrew Weil, médecin diplômé de Harvard et pionnier de la médecine intégrative.',
      science: 'Très élevée. En imposant une expiration deux fois plus longue que l\'inspiration, ce protocole stimule puissamment le nerf vague, déclenchant la réponse parasympathique pour un effet sédatif naturel.'
    },
    stopCondition: 'cycle',
    totalCycles: 4,
    totalTime: null,
    hasWimHofLevel: false,
    getPhases(X) {
      return [
        { text: 'Inspirez discrètement par le nez', duration: X, type: 'inhale' },
        { text: 'Bloquez votre respiration', duration: X * 1.75, type: 'hold' },
        { text: 'Expirez bruyamment par la bouche (son Whoosh)', duration: X * 2, type: 'exhale' },
      ];
    }
  },

  box_breathing: {
    id: 'box_breathing',
    name: 'Respiration au Carré',
    icon: '🧠',
    summary: 'Clarté mentale et sang-froid. La méthode des forces spéciales.',
    info: {
      goal: 'Clarté mentale, concentration accrue, gestion de l\'anxiété avant une prise de parole, un examen ou une décision importante.',
      origin: 'Dérivée du Sama Vritti Pranayama yogique, adoptée par les Navy SEALs américains pour maintenir leur sang-froid en mission.',
      science: 'Excellente. Les apnées de durées égales stabilisent le rythme cardiaque, diminuent le cortisol et synchronisent les ondes cérébrales pour une vigilance calme.'
    },
    stopCondition: 'timer',
    totalCycles: null,
    totalTime: 300, // 5 min
    hasWimHofLevel: false,
    getPhases(X) {
      return [
        { text: 'Inspirez par le nez', duration: X, type: 'inhale' },
        { text: 'Bloquez (poumons pleins)', duration: X, type: 'hold' },
        { text: 'Expirez lentement', duration: X, type: 'exhale' },
        { text: 'Bloquez (poumons vides)', duration: X, type: 'hold' },
      ];
    }
  },

  lymphatic: {
    id: 'lymphatic',
    name: 'Respiration Lymphatique',
    icon: '🧬',
    summary: 'Stimulation immunitaire et détoxification. Ratio 1:4:2.',
    info: {
      goal: 'Stimulation du système immunitaire, activation de la circulation lymphatique, oxygénation cellulaire et détoxification mécanique.',
      origin: 'Popularisée par Tony Robbins dans ses programmes de santé intégrative (« Power Breathing »).',
      science: 'Documentée. Le système lymphatique utilise les variations de pression intra-thoracique pour circuler et filtrer les toxines. Le ratio 1:4:2 maximise cet effet de pompe mécanique.'
    },
    stopCondition: 'timer',
    totalCycles: null,
    totalTime: 300, // 5 min
    hasWimHofLevel: false,
    getPhases(X) {
      return [
        { text: 'Inspirez profondément par le nez', duration: X, type: 'inhale' },
        { text: 'Bloquez (compression lymphatique)', duration: X * 4, type: 'hold' },
        { text: 'Expirez lentement et contrôlez', duration: X * 2, type: 'exhale' },
      ];
    }
  }
};

const PROTOCOL_DEFAULTS = {
  physiological_sigh: 4,  // 4s → 4 / 1 / 8s
  cardiac_coherence:  5,  // fixe (slider masqué)
  wim_hof:            3,  // fixe (slider masqué)
  four_seven_eight:   4,  // 4 / 7 / 8s — ratio scientifique exact
  box_breathing:      4,  // 4 / 4 / 4 / 4s — valeur Navy SEALs
  lymphatic:          3,  // 3 / 12 / 6s — ratio 1:4:2 (max 5s = hold 20s)
};

/** Protocoles pour lesquels le slider est masqué (durée fixe) */
const PROTOCOLS_NO_SLIDER = new Set(['cardiac_coherence', 'wim_hof', 'four_seven_eight']);

/** Ordre de référence (tri à égalité de score) */
const PROTOCOL_ORDER = [
  'physiological_sigh', 'cardiac_coherence', 'wim_hof',
  'four_seven_eight', 'box_breathing', 'lymphatic'
];

/* ================================================================
   2. STORAGE ENGINE — Persistance localStorage
   ================================================================ */

const StorageEngine = {
  KEYS: {
    USAGE:          'oxia_usage',
    LAST:           'oxia_last',
    BASE_DURATION:  'oxia_base_duration',
    MODE:           'oxia_mode',
    WIM_HOF_LEVEL:  'oxia_wim_level',
  },

  _get(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },

  _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  },

  getUsage()            { return this._get(this.KEYS.USAGE, {}); },
  getUsageFor(id)       { return this.getUsage()[id] || 0; },

  incrementUsage(id) {
    const u = this.getUsage();
    u[id] = (u[id] || 0) + 1;
    this._set(this.KEYS.USAGE, u);
  },

  getLastProtocol()     { return this._get(this.KEYS.LAST, 'physiological_sigh'); },
  setLastProtocol(id)   { this._set(this.KEYS.LAST, id); },

  /**
   * Retourne la durée de base pour un protocole donné.
   * Stocké sous forme d'objet { [protocolId]: seconds }.
   * Valeur par défaut : PROTOCOL_DEFAULTS[id].
   */
  getDurations() {
    return this._get(this.KEYS.BASE_DURATION, {});
  },
  getDurationFor(id) {
    const map = this.getDurations();
    return map[id] !== undefined ? map[id] : (PROTOCOL_DEFAULTS[id] || 4);
  },
  setDurationFor(id, v) {
    const map = this.getDurations();
    map[id] = v;
    this._set(this.KEYS.BASE_DURATION, map);
  },

  getMode()             { return this._get(this.KEYS.MODE, 'solid'); }, // 'solid' | 'immersive'
  setMode(v)            { this._set(this.KEYS.MODE, v); },

  getWimHofLevel()      { return this._get(this.KEYS.WIM_HOF_LEVEL, 0); }, // 0|1|2
  setWimHofLevel(v)     { this._set(this.KEYS.WIM_HOF_LEVEL, v); },

  /**
   * Retourne les IDs triés par usage décroissant.
   * En cas d'égalité, l'ordre de référence PROTOCOL_ORDER est conservé.
   */
  getSortedIds() {
    const usage = this.getUsage();
    return [...PROTOCOL_ORDER].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));
  }
};

/* ================================================================
   3. AUDIO ENGINE — Ambiance procédurale gapless (Web Audio API)
   Déclenchement sur geste utilisateur (contrainte iOS Safari)
   ================================================================ */

class AudioEngine {
  constructor() {
    this.ctx          = null;
    this.masterGain   = null;
    this.nodes        = [];
    this.initialized  = false;
  }

  /** Initialiser l'AudioContext depuis un geste utilisateur */
  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
    this._buildAmbient();
    this.initialized = true;
  }

  /** Génération procédurale : bruit marron filtré + drones sinusoïdaux */
  _buildAmbient() {
    const ctx = this.ctx;

    // ── 1. Bruit marron (white noise filtré à faible fréquence)
    const sr = ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(2, sr * 8, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = noiseBuffer.getChannelData(ch);
      let lastOut = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * w) / 1.02;
        lastOut  = data[i];
        data[i] *= 4;
      }
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop   = true; // boucle parfaite (gapless natif)

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type            = 'lowpass';
    noiseFilter.frequency.value = 160;
    noiseFilter.Q.value         = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.07;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();

    // ── 2. Drone fondamental : La1 (55 Hz)
    const drone1 = this._createOsc(55, 'sine', 0.13);

    // ── 3. Quinte : Mi2 (82.4 Hz)
    const drone2 = this._createOsc(82.4, 'sine', 0.07);

    // ── 4. Ton éthéré : La3 (220 Hz) + LFO très lent pour shimmer
    const shimmer     = ctx.createOscillator();
    shimmer.type      = 'sine';
    shimmer.frequency.value = 220;
    const shimmerLFO  = ctx.createOscillator();
    shimmerLFO.type   = 'sine';
    shimmerLFO.frequency.value = 0.07; // ~14s de période

    const lfoGain     = ctx.createGain();
    lfoGain.gain.value = 0.025;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.035;

    shimmerLFO.connect(lfoGain);
    lfoGain.connect(shimmerGain.gain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);
    shimmer.start();
    shimmerLFO.start();

    this.nodes = [noise, drone1.osc, drone2.osc, shimmer, shimmerLFO];
  }

  _createOsc(freq, type, gainValue) {
    const osc  = this.ctx.createOscillator();
    osc.type   = type;
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    return { osc, gain };
  }

  play() {
    if (!this.initialized) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 1.5); // fade-in doux
  }

  pause() {
    if (!this.initialized) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.6); // fade-out
  }

  stop() { this.pause(); }

  destroy() {
    this.nodes.forEach(n => { try { n.stop(); } catch (_) {} });
    this.nodes = [];
    if (this.ctx) { this.ctx.close(); }
    this.initialized = false;
  }
}

/* ================================================================
   4. STARFIELD RENDERER — Canvas particles (mode Immersif)
   ================================================================ */

class StarfieldRenderer {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.stars   = [];
    this.raf     = null;
    this.running = false;
  }

  _initStars() {
    const { width: w, height: h } = this.canvas;
    this.stars = Array.from({ length: 130 }, () => ({
      x:             Math.random() * w,
      y:             Math.random() * h,
      r:             Math.random() * 1.4 + 0.2,
      speed:         Math.random() * 0.12 + 0.04,
      baseOpacity:   Math.random() * 0.55 + 0.2,
      twinkleSpeed:  Math.random() * 0.008 + 0.002,
      twinklePhase:  Math.random() * Math.PI * 2,
    }));
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._initStars();
  }

  start() {
    if (this.running) return;
    this.resize();
    this.running = true;
    this._tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _tick() {
    if (!this.running) return;
    const { ctx, canvas, stars } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      const alpha = s.baseOpacity * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.fill();
      s.y -= s.speed;
      if (s.y < -2) s.y = canvas.height + 2;
    }

    this.raf = requestAnimationFrame(() => this._tick());
  }
}

/* ================================================================
   5. BREATHING ENGINE — File de phases + chronomètre 100 ms
   ================================================================ */

class BreathingEngine {
  /**
   * @param {string}   protocolId
   * @param {number}   baseDuration  — X en secondes
   * @param {number}   wimHofLevel   — 0|1|2
   * @param {Object}   callbacks     — { onCountdown, onPhaseChange, onTick, onComplete }
   */
  constructor(protocolId, baseDuration, wimHofLevel, callbacks) {
    this.protocol    = PROTOCOLS[protocolId];
    this.X           = baseDuration;
    this.wimHofLevel = wimHofLevel;
    this.cb          = callbacks;

    this.state        = 'idle'; // idle|countdown|running|paused|complete
    this.queue        = [];
    this.queueIndex   = 0;
    this.phaseElapsed = 0;  // ms
    this.totalElapsed = 0;  // ms

    this._interval          = null;
    this._lastTick          = null;
    this._countdownInterval = null;
    this._countdown         = 3;
  }

  /* ── Construction de la file de phases ──────────────────── */

  _buildQueue() {
    const { protocol: p, X, wimHofLevel } = this;
    const queue = [];

    if (p.id === 'wim_hof') {
      // 3 grands rounds avec 3 phases chacun
      const apneeDuration = [60, 90, 120][wimHofLevel] * 1000;

      for (let r = 0; r < 3; r++) {
        const roundLabel = `Round ${r + 1}/3`;

        // Phase A : 30 micro-cycles (inspiration + expiration passive)
        for (let i = 0; i < 30; i++) {
          queue.push({ text: 'Inspirez pleinement (Ventre + Poitrine)', duration: 3000, type: 'inhale', label: `${roundLabel} · ${i + 1}/30` });
          queue.push({ text: 'Relâchez passivement l\'air',              duration: 2000, type: 'exhale', label: `${roundLabel} · ${i + 1}/30` });
        }

        // Phase B : Apnée poumons vides
        queue.push({
          text:     'Bloquez poumons vides. Détendez tout votre corps.',
          duration: apneeDuration,
          type:     'hold',
          label:    `${roundLabel} · Apnée`
        });

        // Phase C : Récupération poumons pleins
        queue.push({ text: 'Inspirez à fond !',                                              duration: 3000,  type: 'inhale', label: `${roundLabel} · Récupération` });
        queue.push({ text: 'Bloquez et contractez légèrement le haut du corps',              duration: 15000, type: 'hold',   label: `${roundLabel} · Rétention` });
        queue.push({ text: r < 2 ? 'Relâchez — prochain round…' : 'Relâchez — Terminé ! ✓', duration: 2000,  type: 'exhale', label: `${roundLabel} · Relâche` });
      }
    } else if (p.stopCondition === 'cycle') {
      for (let c = 0; c < p.totalCycles; c++) {
        for (const ph of p.getPhases(this.X)) {
          queue.push({ ...ph, duration: ph.duration * 1000, label: `Cycle ${c + 1}/${p.totalCycles}` });
        }
      }
    } else {
      // timer-based : pré-générer assez de cycles pour couvrir totalTime
      const phases = p.getPhases(this.X);
      const cycleDuration = phases.reduce((s, ph) => s + ph.duration * 1000, 0);
      const maxCycles = Math.ceil((p.totalTime * 1000) / cycleDuration) + 2;
      for (let c = 0; c < maxCycles; c++) {
        for (const ph of phases) {
          queue.push({ ...ph, duration: ph.duration * 1000 });
        }
      }
    }

    return queue;
  }

  /* ── Contrôles ──────────────────────────────────────────── */

  start() {
    this.queue        = this._buildQueue();
    this.queueIndex   = 0;
    this.phaseElapsed = 0;
    this.totalElapsed = 0;
    this.state        = 'countdown';
    this._countdown   = 3;
    this.cb.onCountdown(3);
    this._runCountdown();
  }

  _runCountdown() {
    this._countdownInterval = setInterval(() => {
      this._countdown--;
      if (this._countdown <= 0) {
        clearInterval(this._countdownInterval);
        this.cb.onCountdown(0);
        this._begin();
      } else {
        this.cb.onCountdown(this._countdown);
      }
    }, 1000);
  }

  _begin() {
    this.state      = 'running';
    this._lastTick  = performance.now();
    this._emitPhase();
    this._interval  = setInterval(() => this._tick(), 100);
  }

  _tick() {
    if (this.state !== 'running') return;
    const now   = performance.now();
    const delta = now - this._lastTick;
    this._lastTick   = now;
    this.phaseElapsed += delta;
    this.totalElapsed += delta;

    // Condition d'arrêt timer-based
    const p = this.protocol;
    if (p.stopCondition === 'timer' && this.totalElapsed >= p.totalTime * 1000) {
      this._complete();
      return;
    }

    // Passage à la phase suivante
    const phase = this.queue[this.queueIndex];
    if (phase && this.phaseElapsed >= phase.duration) {
      this.phaseElapsed -= phase.duration;
      this.queueIndex++;
      if (this.queueIndex >= this.queue.length) {
        this._complete();
        return;
      }
      this._emitPhase();
    }

    // Tick UI
    const cur = this.queue[this.queueIndex];
    if (cur) {
      this.cb.onTick({
        phase:         cur,
        phaseElapsed:  this.phaseElapsed,
        phaseDuration: cur.duration,
        totalElapsed:  this.totalElapsed,
        totalDuration: p.totalTime ? p.totalTime * 1000 : null,
      });
    }
  }

  _emitPhase() {
    const ph = this.queue[this.queueIndex];
    if (ph) this.cb.onPhaseChange(ph);
  }

  _complete() {
    clearInterval(this._interval);
    this.state = 'complete';
    this.cb.onComplete();
  }

  pause() {
    if (this.state !== 'running') return;
    this.state = 'paused';
    clearInterval(this._interval);
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state     = 'running';
    this._lastTick = performance.now();
    this._interval = setInterval(() => this._tick(), 100);
  }

  stop() {
    clearInterval(this._interval);
    clearInterval(this._countdownInterval);
    this.state = 'idle';
  }
}

/* ================================================================
   6. UI ENGINE — Rendu DOM & Interactions
   ================================================================ */

class UIEngine {
  constructor(app) {
    this.app = app;

    // ── Home refs
    this.$home         = document.getElementById('home');
    this.$heroTile     = document.getElementById('hero-tile');
    this.$heroControls = document.getElementById('hero-controls');
    this.$grid         = document.getElementById('protocol-grid');

    // ── Player refs
    this.$player       = document.getElementById('player');
    this.$phaseBg      = document.getElementById('phase-bg');
    this.$circle       = document.getElementById('breath-circle');
    this.$phaseText    = document.getElementById('phase-text');
    this.$phaseLabel   = document.getElementById('phase-label');
    this.$progressDisp = document.getElementById('progress-display');
    this.$controls     = document.getElementById('player-controls');
    this.$btnPlayPause = document.getElementById('btn-play-pause');
    this.$iconPause    = document.getElementById('icon-pause');
    this.$iconPlay     = document.getElementById('icon-play');
    this.$countdown    = document.getElementById('countdown-display');
    this.$canvas       = document.getElementById('starfield');

    // ── Bottom Sheet refs
    this.$sheet        = document.getElementById('bottom-sheet');
    this.$sheetContent = document.getElementById('sheet-content');
    this.$sheetOverlay = document.getElementById('sheet-overlay');

    // ── State
    this._controlsTimer  = null;
    this._sheetTouchY    = 0;
    this._circleLastType = 'exhale'; // track pour hold cohérent

    this.starfield = new StarfieldRenderer(this.$canvas);

    this._bindStaticEvents();
  }

  /* ── Événements statiques (non réinitialisés au re-render) ─ */

  _bindStaticEvents() {
    // Bottom sheet : fermer via overlay ou swipe-down
    this.$sheetOverlay.addEventListener('click', () => this.closeBottomSheet());
    this.$sheet.addEventListener('touchstart', e => {
      this._sheetTouchY = e.touches[0].clientY;
    }, { passive: true });
    this.$sheet.addEventListener('touchend', e => {
      if (e.changedTouches[0].clientY - this._sheetTouchY > 60) this.closeBottomSheet();
    }, { passive: true });

    // Player : tap pour afficher/masquer les contrôles
    this.$player.addEventListener('click', e => {
      if (e.target.closest('#player-controls')) return;
      this._toggleControls();
    });

    // Boutons player
    document.getElementById('btn-play-pause').addEventListener('click', e => {
      e.stopPropagation();
      this.app.togglePause();
    });
    document.getElementById('btn-back').addEventListener('click', e => {
      e.stopPropagation();
      this.app.endSession();
    });
  }

  /* ── HOME : rendu complet ───────────────────────────────── */

  renderHome(heroId, sortedIds) {
    const proto = PROTOCOLS[heroId];
    const usage = StorageEngine.getUsage();

    // ── Héros
    this.$heroTile.innerHTML = `
      <div class="hero-emoji">${proto.icon}</div>
      <div class="hero-body">
        <h2 class="hero-name">${proto.name}</h2>
        <p class="hero-summary">${proto.summary}</p>
      </div>
      <button class="btn-info" data-id="${heroId}" aria-label="Informations sur ${proto.name}">?</button>
    `;
    this.$heroTile.querySelector('.btn-info')
      .addEventListener('click', e => { e.stopPropagation(); this.app.openInfo(heroId); });

    // ── Contrôles héros
    const mode       = this.app.mode;
    const hideSlider = PROTOCOLS_NO_SLIDER.has(heroId);
    const dur        = this.app.baseDuration;
    const sliderMax  = heroId === 'lymphatic' ? 5 : 8;

    this.$heroControls.innerHTML = `
      <div class="slider-row">
        ${heroId === 'wim_hof'
          ? this._wimHofInlineHTML()
          : `<div class="slider-group${hideSlider ? ' slider-hidden' : ''}">
              <label for="duration-slider">Durée base</label>
              <input type="range" id="duration-slider" min="2" max="${sliderMax}" step="1"
                     value="${dur}" aria-label="Durée de base en secondes"
                     ${hideSlider ? 'tabindex="-1" aria-hidden="true"' : ''}>
              <span id="slider-value">${dur}s</span>
            </div>`
        }
        <button class="btn-mode-toggle ${mode === 'immersive' ? 'active' : ''}" id="mode-toggle"
                aria-label="Changer le mode d'affichage">
          ${mode === 'solid' ? 'Couleurs' : 'Immersif'}
        </button>
      </div>
      <div class="action-row">
        <button class="btn-hero-play" id="btn-hero-play" aria-label="Démarrer l'exercice">
          ▶ Démarrer
        </button>
      </div>
    `;

    // Slider events (inerte si caché)
    if (!hideSlider) {
      const slider    = document.getElementById('duration-slider');
      const sliderVal = document.getElementById('slider-value');
      slider.addEventListener('input', e => {
        const v = parseInt(e.target.value, 10);
        sliderVal.textContent = `${v}s`;
        this.app.baseDuration = v;
        StorageEngine.setDurationFor(heroId, v);
      });
    }

    // Mode toggle
    document.getElementById('mode-toggle').addEventListener('click', () => this.app.toggleMode());

    // Play
    document.getElementById('btn-hero-play').addEventListener('click', () => this.app.startSession());

    // Wim Hof level buttons
    if (heroId === 'wim_hof') {
      this.$heroControls.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lvl = parseInt(btn.dataset.level);
          this.app.wimHofLevel = lvl;
          StorageEngine.setWimHofLevel(lvl);
          this.$heroControls.querySelectorAll('.level-btn')
            .forEach(b => b.classList.toggle('active', parseInt(b.dataset.level) === lvl));
        });
      });
    }

    // ── Grille (autres protocoles, triés par usage)
    const otherIds = sortedIds.filter(id => id !== heroId);
    this.$grid.innerHTML = otherIds.map(id => {
      const p = PROTOCOLS[id];
      return `
        <div class="proto-tile" data-id="${id}" role="listitem button" tabindex="0"
             aria-label="${p.name}">
          <span class="tile-emoji">${p.icon}</span>
          <span class="tile-name">${p.name}</span>
          <button class="tile-info-btn" data-id="${id}" aria-label="Info ${p.name}">?</button>
        </div>
      `;
    }).join('');

    this.$grid.querySelectorAll('.proto-tile').forEach(tile => {
      tile.addEventListener('click', e => {
        if (e.target.classList.contains('tile-info-btn')) {
          e.stopPropagation();
          this.app.openInfo(e.target.dataset.id);
          return;
        }
        this.app.selectProtocol(tile.dataset.id);
      });
      tile.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') this.app.selectProtocol(tile.dataset.id);
      });
    });
  }

  /** Sélecteur d'apnée Wim Hof — version inline pour la slider-row */
  _wimHofInlineHTML() {
    const current = this.app.wimHofLevel;
    const levels  = ['60s', '90s', '120s'];
    return `
      <div class="wim-hof-inline">
        <span class="wim-hof-label">Apnée</span>
        <div class="level-btns">
          ${levels.map((l, i) => `
            <button class="level-btn ${i === current ? 'active' : ''}"
                    data-level="${i}">${l}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ── BOTTOM SHEET ────────────────────────────────────────── */

  openBottomSheet(id) {
    const p = PROTOCOLS[id];
    const heroRect = document.getElementById('hero-section').getBoundingClientRect();
    // Contrainte : le sheet ne remonte pas au-delà du bord inférieur de la hero section
    const maxH = Math.floor(window.innerHeight - heroRect.bottom - 8);
    this.$sheet.style.maxHeight = `${Math.max(maxH, 200)}px`;

    this.$sheetContent.innerHTML = `
      <div class="sheet-handle" role="presentation"></div>
      <div class="sheet-icon">${p.icon}</div>
      <h3>${p.name}</h3>
      <div class="sheet-section">
        <div class="sheet-label">🎯 Objectif</div>
        <p>${p.info.goal}</p>
      </div>
      <div class="sheet-section">
        <div class="sheet-label">📜 Origine</div>
        <p>${p.info.origin}</p>
      </div>
      <div class="sheet-section">
        <div class="sheet-label">🔬 Efficacité scientifique</div>
        <p>${p.info.science}</p>
      </div>
      <div class="sheet-section sheet-sequence">
        <div class="sheet-label">⏱ Séquence</div>
        ${this._sequenceHTML(id)}
      </div>
    `;

    this.$sheet.classList.add('open');
    this.$sheetOverlay.classList.add('visible');
    this.$sheet.setAttribute('aria-hidden', 'false');
  }

  _sequenceHTML(id) {
    const p = PROTOCOLS[id];
    if (id === 'wim_hof') {
      return `
        <div class="seq-phase inhale">Phase A · 30× [ Inspire 3s + Expire 2s ]</div>
        <div class="seq-phase hold">Phase B · Apnée poumons vides : Débutant 60s · Inter. 90s · Avancé 120s</div>
        <div class="seq-phase inhale">Phase C · Inspire 3s → Rétention 15s → Expire 2s</div>
        <div class="seq-note">Répétés × 3 grands rounds</div>
      `;
    }
    return p.getPhases(this.app.baseDuration).map(ph => `
      <div class="seq-phase ${ph.type}">
        ${ph.text}
        <span>${Math.round(ph.duration)}s</span>
      </div>
    `).join('');
  }

  closeBottomSheet() {
    this.$sheet.classList.remove('open');
    this.$sheetOverlay.classList.remove('visible');
    this.$sheet.setAttribute('aria-hidden', 'true');
  }

  /* ── PLAYER ──────────────────────────────────────────────── */

  showPlayer(mode) {
    this.$home.classList.add('hidden');
    this.$player.classList.remove('hidden');
    this.$player.classList.toggle('mode-immersive', mode === 'immersive');
    this.$player.classList.toggle('mode-solid',     mode === 'solid');

    // Reset cercle
    this.$circle.style.transform       = 'scale(0.65)';
    this.$circle.style.transitionDuration = '0.3s';
    this.$circle.classList.remove('complete');
    this._circleLastType = 'exhale';
    this.$phaseText.textContent    = '';
    this.$phaseLabel.textContent   = '';
    this.$progressDisp.textContent = '';

    if (mode === 'immersive') {
      this.starfield.start();
    } else {
      this.starfield.stop();
      this.$phaseBg.style.backgroundColor = '#0B132B';
    }

    this.showControls(true);
  }

  hidePlayer() {
    this.$player.classList.add('hidden');
    this.$home.classList.remove('hidden');
    this.starfield.stop();
    this._clearControlsTimer();
  }

  /* ── Countdown (3… 2… 1…) ──────────────────────────────── */

  onCountdown(value) {
    if (value <= 0) {
      this.$countdown.classList.remove('visible');
      return;
    }
    this.$countdown.textContent = value;
    this.$countdown.classList.add('visible');
  }

  /* ── Changement de phase ────────────────────────────────── */

  onPhaseChange(phase, mode) {
    const { type, text, label = '', duration } = phase;
    const durSec = (duration / 1000).toFixed(1);

    // Texte
    this.$phaseText.textContent  = text;
    this.$phaseLabel.textContent = label;

    // Cercle — calcul du transform cible
    const circle   = this.$circle;
    const SCALE_BIG  = 1.42;
    const SCALE_SMALL = 0.62;

    if (type === 'inhale') {
      circle.style.transitionDuration = `${durSec}s`;
      circle.style.transitionTimingFunction = 'ease-in-out';
      circle.style.transform = `scale(${SCALE_BIG})`;
      this._circleLastType = 'inhale';
    } else if (type === 'exhale') {
      circle.style.transitionDuration = `${durSec}s`;
      circle.style.transitionTimingFunction = 'ease-in-out';
      circle.style.transform = `scale(${SCALE_SMALL})`;
      this._circleLastType = 'exhale';
    } else {
      // hold : maintenir la taille actuelle, juste changer la couleur
      circle.style.transitionDuration = '0.4s';
      // transform inchangé
    }

    // Couleur
    const COLORS = { inhale: '#4A90E2', exhale: '#2ECC71', hold: '#F5A623' };
    const color = COLORS[type];

    if (mode === 'solid') {
      this.$phaseBg.style.backgroundColor = color;
      circle.style.borderColor = 'rgba(255,255,255,0.75)';
      circle.style.boxShadow   = '0 0 40px rgba(255,255,255,0.1)';
    } else {
      // Immersif : glow coloré sur le cercle
      circle.style.borderColor = color;
      circle.style.boxShadow   = `0 0 50px ${color}55, 0 0 100px ${color}22`;
    }
  }

  /* ── Tick périodique (100 ms) ───────────────────────────── */

  onTick(data) {
    const { totalElapsed, totalDuration, phase } = data;

    if (totalDuration) {
      // Timer-based : compte à rebours global
      const remaining = Math.max(0, Math.ceil((totalDuration - totalElapsed) / 1000));
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      this.$progressDisp.textContent = `${m}:${String(s).padStart(2, '0')}`;
    } else {
      // Cycle-based : label de cycle
      this.$progressDisp.textContent = phase.label || '';
    }
  }

  /* ── Fin de session ─────────────────────────────────────── */

  onComplete() {
    this.$phaseText.textContent  = '✓ Exercice terminé';
    this.$phaseLabel.textContent = 'Bravo !';
    this.$progressDisp.textContent = '';
    this.$circle.classList.add('complete');
    this.$circle.style.transitionDuration = '0.8s';
    this.$circle.style.transform = 'scale(1.1)';
    this.showControls(true);
  }

  /* ── Contrôles player ───────────────────────────────────── */

  showControls(keepVisible = false) {
    this.$controls.classList.add('visible');
    this._clearControlsTimer();
    if (!keepVisible) {
      this._controlsTimer = setTimeout(() => {
        this.$controls.classList.remove('visible');
      }, 3500);
    }
  }

  _toggleControls() {
    if (this.$controls.classList.contains('visible')) {
      this._clearControlsTimer();
      this.$controls.classList.remove('visible');
    } else {
      this.showControls();
    }
  }

  _clearControlsTimer() {
    clearTimeout(this._controlsTimer);
    this._controlsTimer = null;
  }

  updatePlayPauseBtn(isPlaying) {
    this.$iconPause.classList.toggle('hidden', !isPlaying);
    this.$iconPlay.classList.toggle('hidden',   isPlaying);
    this.$btnPlayPause.setAttribute('aria-label', isPlaying ? 'Mettre en pause' : 'Reprendre');
  }
}

/* ================================================================
   7. APP — Orchestrateur principal
   ================================================================ */

class App {
  constructor() {
    // ── État global persisté
    this.heroId      = StorageEngine.getLastProtocol();
    this.mode        = StorageEngine.getMode();
    this.wimHofLevel = StorageEngine.getWimHofLevel();

    // baseDuration est désormais lu/écrit par protocole
    // this.baseDuration = durée du protocole actif (prop de commodité)
    this.baseDuration = StorageEngine.getDurationFor(this.heroId);

    // ── Moteurs
    this.audio   = new AudioEngine();
    this.engine  = null; // BreathingEngine (session en cours)
    this.ui      = null; // UIEngine (initialisé après DOM)

    // ── Flag pour le tri différé hors-champ
    this._sortPending = false;
  }

  init() {
    this.ui = new UIEngine(this);
    this._renderHome();

    // Resize du starfield sur rotation
    window.addEventListener('resize', () => {
      if (this.ui.starfield.running) this.ui.starfield.resize();
    });
  }

  /* ── HOME ───────────────────────────────────────────────── */

  _renderHome() {
    const sorted = StorageEngine.getSortedIds();
    this.ui.renderHome(this.heroId, sorted);
  }

  /**
   * Sélection d'un protocole depuis la grille.
   * Swap instantané du héros. Tri de la grille différé (hors-champ).
   * NB : le compteur N'est PAS incrémenté ici — uniquement au lancement.
   */
  selectProtocol(id) {
    this.heroId = id;
    StorageEngine.setLastProtocol(id);

    // Charger la durée propre à ce protocole
    this.baseDuration = StorageEngine.getDurationFor(id);

    // 1. Mise à jour immédiate du héros
    this._renderHome();

    // 2. Re-tri silencieux de la grille (pendant que l'œil est sur le héros)
    setTimeout(() => this._renderHome(), 250);
  }

  openInfo(id) {
    this.ui.openBottomSheet(id);
  }

  toggleMode() {
    this.mode = this.mode === 'solid' ? 'immersive' : 'solid';
    StorageEngine.setMode(this.mode);
    this._renderHome();
  }

  /* ── SESSION ────────────────────────────────────────────── */

  startSession() {
    // Déverrouillage de l'audio sur geste utilisateur (exigence iOS Safari)
    this.audio.init();

    this.ui.showPlayer(this.mode);
    if (this.mode === 'immersive') this.audio.play();

    // Incrémentation du compteur uniquement au lancement effectif
    StorageEngine.incrementUsage(this.heroId);

    this.engine = new BreathingEngine(
      this.heroId,
      this.baseDuration,
      this.wimHofLevel,
      {
        onCountdown: (v) => this.ui.onCountdown(v),

        onPhaseChange: (phase) => {
          this.ui.onPhaseChange(phase, this.mode);
          // Afficher les contrôles brièvement à chaque changement de phase
          this.ui.showControls();
        },

        onTick: (data) => this.ui.onTick(data),

        onComplete: () => {
          this.audio.stop();
          this.ui.onComplete();
          // Retour automatique 3s après la fin
          setTimeout(() => this.endSession(), 3000);
        }
      }
    );

    this.engine.start();
    this.ui.updatePlayPauseBtn(true);
  }

  togglePause() {
    if (!this.engine) return;

    if (this.engine.state === 'running') {
      this.engine.pause();
      this.audio.pause();
      this.ui.updatePlayPauseBtn(false);
      this.ui.showControls(true); // garder visible pendant la pause
    } else if (this.engine.state === 'paused') {
      this.engine.resume();
      if (this.mode === 'immersive') this.audio.play();
      this.ui.updatePlayPauseBtn(true);
      this.ui.showControls();
    }
  }

  endSession() {
    if (this.engine) {
      this.engine.stop();
      this.engine = null;
    }
    this.audio.stop();
    this.ui.hidePlayer();
    this._renderHome();
  }
}

/* ================================================================
   BOOT
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

/* PWA — Service Worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* SW optionnel, dégradation gracieuse */
    });
  });
}
