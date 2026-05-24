import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView,
  TouchableOpacity, TextInput, Switch, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { colors, radius, spacing } from '../constants/theme';
import { scheduleWorkoutReminder, cancelAllNotifications } from '../utils/notifications';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PerfilModal({ visible, onClose }: Props) {
  const store = useAppStore();
  const latest = store.inbody[store.inbody.length - 1];

  const [name, setName] = useState(store.userName ?? 'Júlio Cezar');
  const [weightGoal, setWeightGoal] = useState(String(store.weightGoal));
  const [calorieGoal, setCalorieGoal] = useState(String(store.calorieGoal));
  const [proteinGoal, setProteinGoal] = useState(String(store.proteinGoal));
  const [waterGoal, setWaterGoal] = useState(String(store.waterGoalMl / 1000));
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState('07');
  const [notifMin, setNotifMin] = useState('00');

  const save = () => {
    store.updateGoals({
      userName: name,
      weightGoal: parseFloat(weightGoal) || 76,
      calorieGoal: parseInt(calorieGoal) || 2200,
      proteinGoal: parseInt(proteinGoal) || 175,
      waterGoalMl: Math.round((parseFloat(waterGoal) || 3) * 1000),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const handleNotifToggle = async (val: boolean) => {
    setNotifEnabled(val);
    if (val) {
      await scheduleWorkoutReminder(parseInt(notifHour) || 7, parseInt(notifMin) || 0);
    } else {
      await cancelAllNotifications();
    }
  };

  const resetData = () => {
    Alert.alert(
      '⚠️ Resetar dados?',
      'Isso apagará todo o histórico de treinos, refeições e jejum. Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar tudo',
          style: 'destructive',
          onPress: () => {
            store.resetAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onClose();
          },
        },
      ]
    );
  };

  const fat = latest ? (latest.weight * latest.fatPct / 100).toFixed(1) : '—';
  const lean = latest ? (latest.weight - parseFloat(fat)).toFixed(1) : '—';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil & Configurações</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnTxt}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <View style={styles.pad}>

            {/* AVATAR / STATS */}
            <View style={styles.avatarCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>💪</Text>
              </View>
              <View style={styles.avatarInfo}>
                <Text style={styles.avatarName}>{name}</Text>
                {latest && (
                  <>
                    <Text style={styles.avatarStat}>{latest.weight}kg · {latest.fatPct}% gordura</Text>
                    <Text style={styles.avatarStat}>{latest.muscle}kg músculo · {fat}kg gordura</Text>
                  </>
                )}
              </View>
            </View>

            {/* NOME */}
            <Section title="Dados Pessoais">
              <Field label="Nome" value={name} onChangeText={setName} />
            </Section>

            {/* METAS */}
            <Section title="Metas">
              <Field
                label="Peso alvo (kg)"
                value={weightGoal}
                onChangeText={setWeightGoal}
                keyboardType="decimal-pad"
                hint={latest ? `Atual: ${latest.weight}kg → Meta: ${weightGoal}kg (${(latest.weight - parseFloat(weightGoal || '0')).toFixed(1)}kg a perder)` : undefined}
              />
              <Field
                label="Calorias diárias (kcal)"
                value={calorieGoal}
                onChangeText={setCalorieGoal}
                keyboardType="numeric"
              />
              <Field
                label="Proteína diária (g)"
                value={proteinGoal}
                onChangeText={setProteinGoal}
                keyboardType="numeric"
                hint="Recomendado: 2g por kg de peso corporal"
              />
              <Field
                label="Água diária (L)"
                value={waterGoal}
                onChangeText={setWaterGoal}
                keyboardType="decimal-pad"
              />
            </Section>

            {/* LEMBRETES */}
            <Section title="Lembretes de Treino">
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Lembrete diário</Text>
                  <Text style={styles.switchSub}>Notificação para não perder o treino</Text>
                </View>
                <Switch
                  value={notifEnabled}
                  onValueChange={handleNotifToggle}
                  trackColor={{ false: colors.surface3, true: colors.orange }}
                  thumbColor="#fff"
                />
              </View>
              {notifEnabled && (
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Horário:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={notifHour}
                    onChangeText={setNotifHour}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="07"
                    placeholderTextColor={colors.muted2}
                  />
                  <Text style={styles.timeColon}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={notifMin}
                    onChangeText={setNotifMin}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={colors.muted2}
                  />
                </View>
              )}
            </Section>

            {/* STATS */}
            <Section title="Resumo Geral">
              <View style={styles.statsGrid}>
                <StatCell label="Treinos" value={Object.values(store.days).filter((d) => d.workoutDone).length} />
                <StatCell label="Jejuns OK" value={store.fastingSessions.filter((f) => f.completed).length} />
                <StatCell label="Sequência" value={store.computeStreak()} />
                <StatCell label="Fotos" value={store.photos.length} />
                <StatCell label="PRs" value={Object.values(store.prs).filter((v) => v > 0).length} />
                <StatCell label="Avaliações" value={store.inbody.length} />
              </View>
            </Section>

            {/* DANGER ZONE */}
            <TouchableOpacity style={styles.resetBtn} onPress={resetData}>
              <Text style={styles.resetBtnTxt}>🗑️ Resetar todos os dados</Text>
            </TouchableOpacity>

            <Text style={styles.version}>PRIME Fit v1.0.0 · React Native + Expo</Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({
  label, value, onChangeText, keyboardType = 'default', hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.muted2}
        selectionColor={colors.orange}
      />
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statCellVal}>{value}</Text>
      <Text style={styles.statCellLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  saveBtn: { backgroundColor: colors.orange, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 10 },
  saveBtnTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
  scroll: { flex: 1 },
  pad: { padding: 16, gap: 16 },
  avatarCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 64, height: 64, backgroundColor: colors.orangeDim,
    borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.orange,
  },
  avatarTxt: { fontSize: 28 },
  avatarInfo: { flex: 1, gap: 2 },
  avatarName: { fontSize: 18, fontWeight: '800', color: colors.text },
  avatarStat: { fontSize: 12, color: colors.muted },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.muted,
  },
  sectionBody: {
    backgroundColor: colors.surface1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  field: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 },
  fieldLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  fieldInput: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    paddingVertical: 0,
  },
  fieldHint: { fontSize: 11, color: colors.muted2, fontStyle: 'italic' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  switchLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  switchSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  timeRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 8,
  },
  timeLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  timeInput: {
    backgroundColor: colors.surface2, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    color: colors.text, fontSize: 18, fontWeight: '800',
    borderWidth: 1, borderColor: colors.border, textAlign: 'center', width: 56,
  },
  timeColon: { fontSize: 20, fontWeight: '800', color: colors.text },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8,
  },
  statCell: {
    flex: 1, minWidth: '30%', backgroundColor: colors.surface2,
    borderRadius: 10, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  statCellVal: { fontSize: 22, fontWeight: '800', color: colors.orange },
  statCellLbl: { fontSize: 10, color: colors.muted, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  resetBtn: {
    backgroundColor: colors.redDim, borderRadius: radius.md, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.red,
  },
  resetBtnTxt: { fontSize: 14, fontWeight: '700', color: colors.red },
  version: { fontSize: 11, color: colors.muted2, textAlign: 'center' },
});
