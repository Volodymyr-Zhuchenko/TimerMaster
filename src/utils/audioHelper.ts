import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { VibrationMode } from '@/types';

// Серія коротких імпульсів: 300ms вібрація, 150ms пауза × 3
const PULSE_PATTERN = [0, 300, 150, 300, 150, 300, 150, 600];

let _player: AudioPlayer | null = null;
let _loopInterval: ReturnType<typeof setInterval> | null = null;

setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
}).catch(() => {});

export async function loadSound(source: number | string | null): Promise<void> {
  await unloadSound();
  if (source == null) return;
  try {
    const avSource = typeof source === 'string' ? { uri: source } : source;
    _player = createAudioPlayer(avSource);
  } catch (e) {
    console.warn('[audioHelper] loadSound failed:', e);
  }
}

export function startLoopingAlert(vibration: VibrationMode): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  if (vibration === 'pulse') Vibration.vibrate(PULSE_PATTERN, true);

  function playOnce() {
    if (_player) { _player.seekTo(0); _player.play(); }
  }
  playOnce();
  _loopInterval = setInterval(playOnce, 2500);
}

export function stopLoopingAlert(): void {
  if (_loopInterval) { clearInterval(_loopInterval); _loopInterval = null; }
  Vibration.cancel();
  if (_player) { _player.pause(); _player.seekTo(0); }
}

export async function unloadSound(): Promise<void> {
  stopLoopingAlert();
  if (_player) {
    try { _player.remove(); } catch { /* ігноруємо */ }
    _player = null;
  }
}
