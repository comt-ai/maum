// Soothing audio chime using Web Audio API
export function playChime(type: 'calm' | 'complete' | 'breathe-in' | 'breathe-out' = 'calm') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'calm' || type === 'complete') {
      const notes = type === 'calm' ? [523.25, 659.25, 783.99] : [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
      });
    } else if (type === 'breathe-in') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 3.8); // A4

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 4.0);
    } else if (type === 'breathe-out') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 7.5); // C4

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.0);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 7.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 8.0);
    }
  } catch (err) {
    console.debug('Web Audio not supported or blocked:', err);
  }
}

// Korean Text-to-Speech using Web Speech API
export function speakText(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop ongoing speech

    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // Slightly slower, calm cadence
    utterance.pitch = 1.0;

    // Pick a Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find((v) => v.lang.startsWith('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
