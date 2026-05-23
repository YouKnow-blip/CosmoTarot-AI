// Magical sound synthesizers and haptic feedback triggers for the premium user experience
import { TelegramUser } from "../types";

// Safe wrapper for Telegram WebApp environment
export const getTelegramWebApp = () => {
  if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp;
  }
  return null;
};

// Return actual TG User or generate a detailed customizable mock profile for previewing in AI Studio
export const getTelegramUser = (): TelegramUser => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.first_name}`
    };
  }

  // Consistent mock data in AI Studio preview
  return {
    id: 77712345,
    firstName: "Екатерина",
    lastName: "Смирнова",
    username: "mystic_lady",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
  };
};

// Check if app is inside Telegram WebApp
export const isTelegramEnvironment = (): boolean => {
  return !!getTelegramWebApp();
};

// Trigger mobile haptics / vibration
export const triggerVibration = (type: "light" | "medium" | "heavy" | "success" | "warning") => {
  const tg = getTelegramWebApp();
  
  if (tg && tg.HapticFeedback) {
    try {
      if (type === "success" || type === "warning") {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
      return;
    } catch (e) {
      console.warn("Telegram Haptics not ready:", e);
    }
  }

  // Fallback to Web API
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      const duration = type === "light" ? 15 : type === "medium" ? 35 : type === "heavy" ? 60 : type === "success" ? [40, 40, 40] : [60, 100, 60];
      navigator.vibrate(duration);
    } catch (_) {}
  }
};

// Audio synthesis context
let audioCtx: AudioContext | null = null;
const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a low rustling, sweeping pitch bend for a card flip/shuffle sound
export const playFlipSound = () => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    // Low band-passed noise or low frequency sinus sweep
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(250, now);
    filter.Q.setValueAtTime(2.0, now);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (error) {
    // Audio context permissions or issues, fail silently
    console.debug("Audio synthesis bypassed:", error);
  }
};

// Play celestial chime (arpeggio sequence of sine wave oscillators)
export const playMagicalChime = () => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // Beautiful C Major 7 / 9 scale

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const delay = idx * 0.08;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      
      // Pitch vibration (vibrato) for a shining mystical tone
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 14; // Speed
      lfoGain.gain.value = 8; // Depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gainNode.gain.setValueAtTime(0.001, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.85);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      lfo.start(now + delay);
      osc.start(now + delay);
      
      lfo.stop(now + delay + 0.9);
      osc.stop(now + delay + 0.9);
    });
  } catch (error) {
    console.debug("Audio synthesis bypassed:", error);
  }
};

// Play triumphant golden chime chord when compatability or rare readings happen
export const playCelestialSuccessSound = () => {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    // Harmonized chord (Major 7th high register)
    const chord = [440.00, 554.37, 659.25, 830.61, 1108.73]; // A Major 7

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      
      // Warm mystical filter
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(1500, now);
      lpFilter.frequency.exponentialRampToValueAtTime(300, now + 1.2);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(lpFilter);
      lpFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.7);
    });
  } catch (error) {
    console.debug("Audio synthesis bypassed:", error);
  }
};
