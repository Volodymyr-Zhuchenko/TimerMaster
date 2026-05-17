export interface ThemeColors {
  background: string;
  surface: string;
  surface2: string;
  surface3: string;
  /** Green — running state, active selection, progress */
  start: string;
  startInk: string;
  /** Red — pause, stop, danger */
  stop: string;
  stopInk: string;
  /** Blue — lap highlights */
  lap: string;
  lapInk: string;
  border: string;
  borderSoft: string;
  text: string;
  textMuted: string;
  textDim: string;
  /** Idle tick marks in TickDial */
  tickIdle: string;
}

export const DARK_THEME: ThemeColors = {
  background: '#0E0F12',
  surface: '#16181C',
  surface2: '#1E2126',
  surface3: '#262A30',
  start: '#5BE584',
  startInk: '#0A2914',
  stop: '#FF6B6B',
  stopInk: '#2A0808',
  lap: '#6E9BFF',
  lapInk: '#0A1530',
  border: '#262A30',
  borderSoft: '#1E2126',
  text: '#ECECEC',
  textMuted: '#8B9098',
  textDim: '#5A6068',
  tickIdle: '#2A2E35',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#F6F6F4',
  surface: '#FFFFFF',
  surface2: '#F0F0EC',
  surface3: '#E7E7E2',
  start: '#16A34A',
  startInk: '#FFFFFF',
  stop: '#E63946',
  stopInk: '#FFFFFF',
  lap: '#2D6AE0',
  lapInk: '#FFFFFF',
  border: '#E5E5E0',
  borderSoft: '#EFEFEA',
  text: '#161616',
  textMuted: '#6A6E73',
  textDim: '#A0A4AA',
  tickIdle: '#DCDCD6',
};
