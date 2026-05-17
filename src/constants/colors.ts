// ============================================================
// Дизайн-система TimeMaster: два повних набори кольорів.
// Усі компоненти отримують кольори через хук useTheme() —
// це дозволяє миттєво змінювати тему без перемонтування дерева.
// ============================================================

export interface ThemeColors {
  background: string;
  /** Фон карток і рядків списку */
  surface: string;
  /** Зелений акцент — кнопки, активна дуга, виділений елемент */
  accent: string;
  /** Колір кордонів, неактивна дуга прогресу */
  border: string;
  /** Основний текст */
  text: string;
  /** Другорядний текст (підписи, мітки) */
  textMuted: string;
  /** Фон нижньої панелі навігації */
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const DARK_THEME: ThemeColors = {
  background: '#0E0F12',
  surface: '#161920',
  accent: '#5BE584',
  border: '#262A30',
  text: '#ECECEC',
  textMuted: '#8B9098',
  tabBar: '#0E0F12',
  tabBarActive: '#5BE584',
  tabBarInactive: '#8B9098',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  accent: '#2CA85A',
  border: '#D8DBE0',
  text: '#1A1C20',
  textMuted: '#6B7280',
  tabBar: '#FFFFFF',
  tabBarActive: '#2CA85A',
  tabBarInactive: '#9CA3AF',
};
