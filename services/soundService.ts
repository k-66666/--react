
// Audio Context Singleton for synth sounds (UI clicks)
let audioCtx: AudioContext | null = null;

const getCtx = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

// --- SYNTHESIZED UI SOUNDS (Focus/Click) ---

// Soft "Pop" / Bubble sound for Focusing (Input expansion)
export const playFocusSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle frequency ramp for a "bubble" pop feel
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(t + 0.2);
  } catch (e) {
    // ignore
  }
};

// "Thock" / Mechanical Click sound for Save/Blur
export const playCommitSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Triangle wave for a cleaner "mechanical" thud
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(t + 0.15);
  } catch (e) {
    // ignore
  }
};

// --- REAL NETWORK KITTEN SOUNDS (CURATED LIST) ---
// Filtered to only include clear, high-pitched kitten meows.
const CUTE_KITTEN_URLS = [
  // Sweet Kitty Meow (Very Clean)
  "https://assets.mixkit.co/active_storage/sfx/93/93-preview.mp3",
  // Little Cat Attention (Short Squeak)
  "https://assets.mixkit.co/active_storage/sfx/86/86-preview.mp3",
  // Domestic Cat Meow (Standard cute)
  "https://assets.mixkit.co/active_storage/sfx/87/87-preview.mp3"
];

export const playRandomMeow = () => {
  try {
    const randomIndex = Math.floor(Math.random() * CUTE_KITTEN_URLS.length);
    const audio = new Audio(CUTE_KITTEN_URLS[randomIndex]);
    
    // Natural Variation: Randomize volume slightly
    audio.volume = 0.4 + Math.random() * 0.3; // 0.4 to 0.7
    
    // Natural Variation: Randomize pitch/speed slightly (1.1 to 1.25)
    // Shift PITCH UP to ensure it sounds small and cute, avoiding deep "tractor" sounds
    audio.playbackRate = 1.1 + Math.random() * 0.15;
    
    // Use a promise to catch autoplay errors (common in modern browsers without interaction)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Audio play blocked or failed:", error);
      });
    }
  } catch (e) {
    console.error("Failed to play cat sound", e);
  }
};
