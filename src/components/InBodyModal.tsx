import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function InBodyModal({ visible, onClose }: Props) {
  const store = useAppStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(todayStr);
  const [weight, setWeight] = useState('');
  const [muscle, setMuscle] = useState('');
  const [fatPct, setFatPct] = useState('');
  const [bmi, setBmi] = useState('');
  const [visc, setVisc] = useState('');

  const w = parseFloat(weight);
  const m = parseFloat(muscle);
  const f = parseFloat(fatPct);
  const fatMass = !isNaN(w) && !isNaN(f) ? (w * f / 100).toFixed(1) : null;
  const leanMass = !isNaN(w) && !isNaN(f) ? (w - w * f / 100).toFixed(1) : null;
  const canSave = !isNaN(w) && w > 0 && !isNaN(m) && m > 0 && !isNaN(f) && f > 0;

  const save = () => {
    if (!canSave) return;
    store.addInBody({
      date,
      weight: w,
      muscle: m,
      fatPct: f,
      bmi: bmi ? parseFloat(bmi) : null,
      visc: visc ? parseInt(visc) : null,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWeight(''); setMuscle(''); setFatPct(''); setBmi(''); setVisc('');
    setDate(todayStr);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Nova Avaliação InBody</Text>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={save} disabled={!canSave}
            >
              <Text style={styles.saveBtnTxt}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            <View style={styles.pad}>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data da Avaliação</Text>
                <View style={styles.sectionBody}>
                  <TextInput
                    style={styles.dateInput}
                    value={date} onChangeText={setDate}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.muted2}
                    selectionColor={colors.orange}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Composição Corporal *</Text>
                <View style={styles.sectionBody}>
                  <View style={styles.fieldsRow}>
                    <InBodyField label="Peso Total" value={weight} onChange={setWeight} placeholder="84.0" unit="kg" />
                    <View style={styles.divider} />
                    <InBodyField label="Massa Muscular" value={muscle} onChange={setMuscle} placeholder="37.0" unit="kg" />
                  </View>
                  <View style={[styles.fieldsRow, styles.borderTop]}>
                    <InBodyField label="% Gordura" value={fatPct} onChange={setFatPct} placeholder="23.1" unit="%" />
                    <View style={styles.divider} />
                    <View style={styles.calcCell}>
                      {fatMass
                        ? <>
                            <Text style={styles.calcRed}>{fatMass}kg gordura</Text>
                            <Text style={styles.calcGreen}>{leanMass}kg magra</Text>
                          </>
                        : <Text style={styles.calcHint}>calculado auto.</Text>
                      }
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Métricas Adicionais (opcional)</Text>
                <View style={styles.sectionBody}>
                  <View style={styles.fieldsRow}>
                    <InBodyField label="IMC" value={bmi} onChange={setBmi} placeholder="30.1" unit="" />
                    <View style={styles.divider} />
                    <InBodyField label="Gordura Visceral" value={visc} onChange={setVisc} placeholder="8" unit="nv" />
                  </View>
                </View>
              </View>

              {canSave && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>📊 Resumo da Avaliação</Text>
                  <View style={styles.previewGrid}>
                    <PreviewCell label="Peso" value={`${w}kg`} color={colors.text} />
                    <PreviewCell label="Músculo" value={`${m}kg`} color={colors.green} />
                    <PreviewCell label="% Gordura" value={`${f}%`} color={colors.orange} />
                    <PreviewCell label="Massa Gorda" value={`${fatMass}kg`} color={colors.red} />
                  </View>

                  {store.inbody.length > 0 && (() => {
                    const last = store.inbody[store.inbody.length - 1];
                    const dw = (w - last.weight).toFixed(1);
                    const dm = (m - last.muscle).toFixed(1);
                    const df = (f - last.fatPct).toFixed(1);
                    return (
                      <View style={styles.deltaRow}>
                        <Text style={styles.deltaTxt}>vs última: </Text>
                        <Delta label="Peso" val={parseFloat(dw)} unit="kg" inverse />
                        <Delta label="Músculo" val={parseFloat(dm)} unit="kg" />
                        <Delta label="Gordura" val={parseFloat(df)} unit="%" inverse />
                      </View>
                    );
                  })()}
                </View>
              )}

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function InBodyField({ label, value, onChange, placeholder, unit }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; unit: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value} onChangeText={onChange}
          placeholder={placeholder} placeholderTextColor={colors.muted2}
          keyboardType="decimal-pad" selectionColor={colors.orange}
        />
        {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function PreviewCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.previewCell}>
      <Text style={[styles.previewVal, { color }]}>{value}</Text>
      <Text style={styles.previewLbl}>{label}</Text>
    </View>
  );
}

function Delta({ label, val, unit, inverse }: { label: string; val: number; unit: string; inverse?: boolean }) {
  const positive = inverse ? val < 0 : val > 0;
  const color = val === 0 ? colors.muted : positive ? colors.green : colors.red;
  return (
    <Text style={[styles.deltaItem, { color }]}>
      {val > 0 ? '+' : ''}{val.toFixed(1)}{unit} {label}{'  '}
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  cancelTxt: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.orange, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 8 },
  saveBtnDisabled: { backgroundColor: colors.surface3 },
  saveBtnTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
  scroll: { flex: 1 },
  pad: { padding: 16, gap: 16 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted },
  sectionBody: {
    backgroundColor: colors.surface1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  fieldsRow: { flexDirection: 'row' },
  borderTop: { borderTopWidth: 1, borderTopColor: colors.border },
  divider: { width: 1, backgroundColor: colors.border },
  calcCell: { flex: 1, padding: 14, justifyContent: 'center', alignItems: 'center', gap: 4 },
  calcRed: { fontSize: 13, fontWeight: '800', color: colors.red },
  calcGreen: { fontSize: 12, color: colors.green, fontWeight: '600' },
  calcHint: { fontSize: 11, color: colors.muted2, fontStyle: 'italic', textAlign: 'center' },
  dateInput: { padding: 14, fontSize: 16, fontWeight: '700', color: colors.text },
  fieldWrap: { flex: 1, padding: 14, gap: 4 },
  fieldLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  fieldRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  fieldInput: { flex: 1, fontSize: 24, fontWeight: '800', color: colors.text, paddingVertical: 0 },
  fieldUnit: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  previewCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  previewTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewCell: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface2,
    borderRadius: 10, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  previewVal: { fontSize: 20, fontWeight: '800' },
  previewLbl: { fontSize: 10, color: colors.muted, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  deltaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  deltaTxt: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  deltaItem: { fontSize: 12, fontWeight: '700' },
});
