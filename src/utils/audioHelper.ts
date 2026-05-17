import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { VibrationMode } from '@/types';

// Серія коротких імпульсів: 300ms вібрація, 150ms пауза × 3
const PULSE_PATTERN = [0, 300, 150, 300, 150, 300, 150, 600];

let _player: AudioPlayer | null = null;

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
  if (vibration === 'pulse') {
    Vibration.vibrate(PULSE_PATTERN, true);
  }
  if (_player) {
    _player.loop = true;
    _player.seekTo(0);
    _player.play();
  }
}

export function stopLoopingAlert(): void {
  Vibration.cancel();
  if (_player) {
    _player.loop = false;
    _player.pause();
    _player.seekTo(0);
  }
}

export async function unloadSound(): Promise<void> {
  stopLoopingAlert();
  if (_player) {
    try { _player.remove(); } catch { /* ігноруємо */ }
    _player = null;
  }
}
