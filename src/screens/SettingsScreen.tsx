import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { SOUND_THEMES } from '@/constants/soundThemes';
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

// ─── Main screen ─────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, themeMode, toggleTheme } = useTheme();
  const { soundTheme, setSoundTheme, customSounds, addCustomSound, removeCustomSound } = useSettings();
  const [importing, setImporting] = useState(false);

  async function handlePickSound() {
    if (importing) return;
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: false });
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

  const canAddMore = customSounds.length < 5;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerSub, { color: colors.textMuted, fontFamily: FONT_FAMILY.regular }]}>
          03 · Налаштування
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Налаштування</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Зовнішній вигляд ── */}
        <Section title="Зовнішній вигляд">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.themeGrid}>
              {/* Темна */}
              <TouchableOpacity
                onPress={() => themeMode !== 'dark' && toggleTheme()}
                activeOpacity={0.7}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: themeMode === 'dark' ? colors.surface3 : 'transparent',
                    borderColor: themeMode === 'dark' ? colors.text : colors.borderSoft,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>🌙</Text>
                <Text style={[styles.themeBtnLabel, { color: colors.text }]}>Темна</Text>
              </TouchableOpacity>
              {/* Світла */}
              <TouchableOpacity
                onPress={() => themeMode !== 'light' && toggleTheme()}
                activeOpacity={0.7}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: themeMode === 'light' ? colors.surface3 : 'transparent',
                    borderColor: themeMode === 'light' ? colors.text : colors.borderSoft,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>☀️</Text>
                <Text style={[styles.themeBtnLabel, { color: colors.text }]}>Світла</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        {/* ── Звукове сповіщення ── */}
        <Section title="Звукове сповіщення">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Built-in themes */}
            {SOUND_THEMES.map((theme, i) => {
              const isActive = soundTheme === theme.key;
              return (
                <TouchableOpacity
                  key={theme.key}
                  onPress={() => setSoundTheme(theme.key)}
                  activeOpacity={0.7}
                >
                  <Row
                    label={theme.label}
                    sub={theme.description}
                    trailing={
                      <View style={[
                        styles.radioCircle,
                        {
                          borderColor: isActive ? colors.start : colors.border,
                          backgroundColor: isActive ? colors.start : 'transparent',
                        },
                      ]}>
                        {isActive && <Text style={{ color: colors.startInk, fontSize: 10 }}>✓</Text>}
                      </View>
                    }
                  />
                  {i < SOUND_THEMES.length - 1 && <Divider />}
                </TouchableOpacity>
              );
            })}

            {/* Custom sounds */}
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

            {/* Add button */}
            <Divider />
            <TouchableOpacity
              onPress={handlePickSound}
              activeOpacity={canAddMore ? 0.7 : 1}
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
  headerSub: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
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
  themeGrid: { flexDirection: 'row', gap: 6, padding: 8 },
  themeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6,
  },
  themeBtnLabel: { fontSize: 14, fontWeight: '500' },

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
