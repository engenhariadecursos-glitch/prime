import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function WeightLogModal({ visible, onClose }: Props) {
  const store = useAppStore();
  const today = store.getToday();
  const latest = store.inbody[store.inbody.length - 1];
  const [weight, setWeight] = useState(
    today.weight ? String(today.weight) : String(latest?.weight ?? '')
  );

  const save = () => {
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      store.setDayWeight(w);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Keyboard.dismiss();
    onClose();
  };

  const diff = latest && !isNaN(parseFloat(weight))
    ? (parseFloat(weight) - latest.weight).toFixed(1)
    : null;
  const diffColor = diff
    ? parseFloat(diff) < 0 ? colors.green : parseFloat(diff) > 0 ? colors.red : colors.muted
    : colors.muted;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>⚖️ Peso de Hoje</Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="84.0"
              placeholderTextColor={colors.muted2}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.unit}>kg</Text>
          </View>

          {diff && (
            <Text style={[styles.diff, { color: diffColor }]}>
              {parseFloat(diff) > 0 ? '+' : ''}{diff}kg desde última avaliação ({latest?.weight}kg)
            </Text>
          )}

          {store.weightGoal && (
            <Text style={styles.goal}>
              Meta: {store.weightGoal}kg · Faltam{' '}
              <Text style={{ color: colors.orange }}>
                {!isNaN(parseFloat(weight)) ? (parseFloat(weight) - store.weightGoal).toFixed(1) : '—'}kg
              </Text>
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelTxt}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirm} onPress={save}>
              <Text style={styles.confirmTxt}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    backgroundColor: colors.surface1, borderRadius: radius.xl, padding: 24,
    width: '100%', borderWidth: 1, borderColor: colors.border, gap: 16,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface2, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.orange, padding: 16, gap: 8,
  },
  input: {
    fontSize: 48, fontWeight: '900', color: colors.orange,
    textAlign: 'center', minWidth: 120, letterSpacing: -2,
  },
  unit: { fontSize: 20, color: colors.muted, fontWeight: '700', marginTop: 12 },
  diff: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  goal: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  cancel: {
    flex: 1, backgroundColor: colors.surface2, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  cancelTxt: { fontSize: 15, fontWeight: '700', color: colors.muted },
  confirm: {
    flex: 1, backgroundColor: colors.orange, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  confirmTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
