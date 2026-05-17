import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { DARK_THEME, LIGHT_THEME } from '@/constants/colors';
import { FONT_FAMILY } from '@/constants/fonts';
import type { CustomSound } from '@/types';

// ─── Section wrapper ──────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
        {title}
      </Text>
      <View style={{ height: 8 }} />
      {children}
    </View>
  );
}

// ─── Row with icon, label, subtitle, trailing ─────────────

function Row({
  label,
  sub,
  trailing,
  onPress,
}: {
  label: string;
  sub?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const inner = (
    <View style={styles.rowInner}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {sub && <Text style={[styles.rowSub, { color: colors.textMuted }]}>{sub}</Text>}
      </View>
      {trailing}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

// ─── Divider ─────────────────────────────────────────────

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />;
}

// ─── Theme preview card ───────────────────────────────────

function ThemeCard({
  mode,
  label,
  icon,
  isActive,
  onPress,
}: {
  mode: 'light' | 'dark';
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const c = mode === 'dark' ? DARK_THEME : LIGHT_THEME;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.themeCard,
        {
          backgroundColor: c.background,
          borderColor: isActive ? colors.text : colors.borderSoft,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.themeCardPreview, { backgroundColor: c.background }]}>
        <View style={[styles.themeCardBar, { backgroundColor: c.surface2 }]} />
        <Text style={[styles.themeCardTime, { color: c.text, fontFamily: FONT_FAMILY.light }]}>
          02:31
        </Text>
        <View style={styles.themeCardDots}>
          <View style={[styles.themeDot, { backgroundColor: '#5BE584' }]} />
          <View style={[styles.themeDot, { backgroundColor: '#FF6B6B' }]} />
          <View style={[styles.themeDot, { backgroundColor: '#6E9BFF' }]} />
        </View>
      </View>
      <View style={[styles.themeCardFooter, { borderTopColor: c.border, backgroundColor: c.surface }]}>
        <Text style={{ fontSize: 15 }}>{icon}</Text>
        <Text style={[styles.themeCardFooterText, { color: c.text, fontFamily: FONT_FAMILY.medium }]}>
          {label}
        </Text>
        {isActive && (
          <View style={[styles.themeCardCheck, { backgroundColor: colors.start }]}>
            <Text style={{ color: colors.startInk, fontSize: 10 }}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, themeMode, resolvedMode, setThemeMode } = useTheme();
  const { soundTheme, setSoundTheme, customSounds, addCustomSound, removeCustomSound, vibration, setVibration } = useSettings();
  const [importing, setImporting] = useState(false);

  async function handlePickSound() {
    if (importing) return;
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (result.canceled) return;

      const asset = result.assets[0];
      const id = Date.now().toString();
      const dest = `${FileSystem.documentDirectory}custom_sound_${id}.mp3`;
      await FileSystem.copyAsync({ from: asset.uri, to: dest });

      const newSound: CustomSound = { id, name: asset.name ?? `Звук ${id}`, uri: dest };
      addCustomSound(newSound);
      setSoundTheme(id);
    } catch (e) {
      console.warn('[SettingsScreen] import sound error:', e);
    } finally {
      setImporting(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Налаштування</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Зовнішній вигляд ── */}
        <Section title="Зовнішній вигляд">
          <View style={styles.themeCardsRow}>
            <ThemeCard
              mode="light"
              label="Світла"
              icon="☀️"
              isActive={themeMode === 'light'}
              onPress={() => setThemeMode('light')}
            />
            <ThemeCard
              mode="dark"
              label="Темна"
              icon="🌙"
              isActive={themeMode === 'dark'}
              onPress={() => setThemeMode('dark')}
            />
          </View>
          <View style={[styles.systemRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.systemIconBadge}>
              <Text style={{ fontSize: 18 }}>☀️</Text>
            </View>
            <Text style={[styles.systemRowLabel, { color: colors.text }]}>
              Автоматично за системою
            </Text>
            <Switch
              value={themeMode === 'system'}
              onValueChange={(v) => setThemeMode(v ? 'system' : resolvedMode)}
              trackColor={{ false: colors.borderSoft, true: colors.start }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.borderSoft}
            />
          </View>
        </Section>

        {/* ── Звукове сповіщення ── */}
        <Section title="Звукове сповіщення">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Дефолтний звук */}
            <TouchableOpacity onPress={() => setSoundTheme('default')} activeOpacity={0.7}>
              <Row
                label="Звук за замовчуванням"
                trailing={
                  <View style={[styles.radioCircle, {
                    borderColor: soundTheme === 'default' ? colors.start : colors.border,
                    backgroundColor: soundTheme === 'default' ? colors.start : 'transparent',
                  }]}>
                    {soundTheme === 'default' && <Text style={{ color: colors.startInk, fontSize: 10 }}>✓</Text>}
                  </View>
                }
              />
            </TouchableOpacity>

            {/* Кастомні звуки */}
            {customSounds.map((cs) => {
              const isActive = soundTheme === cs.id;
              return (
                <View key={cs.id}>
                  <Divider />
                  <View style={styles.rowInner}>
                    <TouchableOpacity
                      style={styles.rowText}
                      onPress={() => setSoundTheme(cs.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>
                        {cs.name}
                      </Text>
                      <Text style={[styles.rowSub, { color: colors.textMuted }]}>власний звук</Text>
                    </TouchableOpacity>
                    <View style={styles.rowActions}>
                      {isActive && (
                        <View style={[styles.radioCircle, { borderColor: colors.start, backgroundColor: colors.start }]}>
                          <Text style={{ color: colors.startInk, fontSize: 10 }}>✓</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => removeCustomSound(cs.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.deleteBtn}
                      >
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Кнопка додавання */}
            <Divider />
            <TouchableOpacity
              onPress={handlePickSound}
              activeOpacity={0.7}
              style={[styles.addBtn, { opacity: importing ? 0.6 : 1 }]}
            >
              {importing ? (
                <ActivityIndicator color={colors.start} />
              ) : (
                <Text style={[styles.addBtnLabel, { color: colors.start, fontFamily: FONT_FAMILY.medium }]}>
                  {`+ Додати звук (${customSounds.length} / 5)`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Section>

        {/* ── Вібрація ── */}
        <Section title="Вібрація">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setVibration('off')} activeOpacity={0.7}>
              <Row
                label="Вимкнено"
                trailing={
                  <View style={[styles.radioCircle, {
                    borderColor: vibration === 'off' ? colors.start : colors.border,
                    backgroundColor: vibration === 'off' ? colors.start : 'transparent',
                  }]}>
                    {vibration === 'off' && <Text style={{ color: colors.startInk, fontSize: 10 }}>✓</Text>}
                  </View>
                }
              />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity onPress={() => setVibration('pulse')} activeOpacity={0.7}>
              <Row
                label="Серія імпульсів"
                trailing={
                  <View style={[styles.radioCircle, {
                    borderColor: vibration === 'pulse' ? colors.start : colors.border,
                    backgroundColor: vibration === 'pulse' ? colors.start : 'transparent',
                  }]}>
                    {vibration === 'pulse' && <Text style={{ color: colors.startInk, fontSize: 10 }}>✓</Text>}
                  </View>
                }
              />
            </TouchableOpacity>
          </View>
        </Section>

        {/* ── Про застосунок ── */}
        <Section title="Інше">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Row label="Про додаток" sub="TimeMaster v1.0 · Залікова робота" />
          </View>
        </Section>

        <Text style={[styles.footer, { color: colors.textDim, fontFamily: FONT_FAMILY.regular }]}>
          зроблено зі швидкістю 60 fps
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '600', letterSpacing: -0.3 },

  scroll: { paddingBottom: 48 },

  section: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600' },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Theme selector
  themeCardsRow: { flexDirection: 'row', gap: 10 },
  themeCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  themeCardPreview: { padding: 14, paddingBottom: 10, alignItems: 'center', gap: 8 },
  themeCardBar: { height: 6, width: '65%', borderRadius: 999 },
  themeCardTime: { fontSize: 20, letterSpacing: -0.5 },
  themeCardDots: { flexDirection: 'row', gap: 6 },
  themeDot: { width: 13, height: 13, borderRadius: 7 },
  themeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  themeCardFooterText: { flex: 1, fontSize: 13, fontWeight: '500' },
  themeCardCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  systemIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4A228',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemRowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  // Row layout
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  divider: { height: 1, marginLeft: 16 },

  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  deleteBtn: { padding: 2 },

  addBtn: { padding: 14, alignItems: 'center' },
  addBtnLabel: { fontSize: 15 },

  footer: {
    textAlign: 'center',
    padding: 24,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
