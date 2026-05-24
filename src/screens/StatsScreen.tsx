import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { colors, radius } from '../constants/theme';
import { formatDateShort } from '../utils/dateUtils';
import { ProgressPhoto } from '../types';

const W = Dimensions.get('window').width - 40;
type Tab = 'corpo' | 'consistencia' | 'fotos';

export function StatsScreen() {
  const store = useAppStore();
  const [tab, setTab] = useState<Tab>('corpo');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progresso</Text>
      </View>

      {/* SUB-TABS */}
      <View style={styles.subTabs}>
        {(['corpo', 'consistencia', 'fotos'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.subTab, tab === t && styles.subTabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(t); }}
          >
            <Text style={[styles.subTabTxt, tab === t && styles.subTabTxtActive]}>
              {t === 'corpo' ? 'Corpo' : t === 'consistencia' ? 'Consistência' : 'Fotos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.pad}>
          {tab === 'corpo' && <CorpoTab store={store} />}
          {tab === 'consistencia' && <ConsistenciaTab store={store} />}
          {tab === 'fotos' && <FotosTab store={store} />}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CorpoTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { inbody } = store;
  const latest = inbody[inbody.length - 1];
  const first = inbody[0];

  if (!latest) return <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>Sem dados InBody</Text>;

  const weightChange = first ? latest.weight - first.weight : 0;
  const muscleChange = first ? latest.muscle - first.muscle : 0;
  const fatChange = first ? latest.fatPct - first.fatPct : 0;

  const chartH = 160;
  const chartW = W - 32;
  const weights = inbody.map((m) => m.weight);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const pts = inbody.map((m, i) => {
    const x = inbody.length < 2 ? chartW / 2 : (i / (inbody.length - 1)) * chartW;
    const y = chartH - ((m.weight - minW) / (maxW - minW)) * chartH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <>
      {/* LATEST INBODY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Última Avaliação</Text>
        <Text style={styles.cardSub}>{formatDateShort(latest.date)}</Text>
        <View style={styles.inbodyGrid}>
          <InBodyCell label="Peso" value={`${latest.weight}kg`} />
          <InBodyCell label="Músculo" value={`${latest.muscle}kg`} color={colors.green} />
          <InBodyCell label="% Gordura" value={`${latest.fatPct}%`} color={colors.orange} />
          {latest.bmi && <InBodyCell label="IMC" value={`${latest.bmi}`} />}
          {latest.visc && <InBodyCell label="Gord. Visc." value={`${latest.visc}`} color={colors.red} />}
        </View>
      </View>

      {/* CHANGES */}
      {first && first.id !== latest.id && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolução Total</Text>
          <Text style={styles.cardSub}>{formatDateShort(first.date)} → {formatDateShort(latest.date)}</Text>
          <View style={styles.changesRow}>
            <ChangeCard label="Peso" value={weightChange} unit="kg" inverse />
            <ChangeCard label="Músculo" value={muscleChange} unit="kg" />
            <ChangeCard label="Gordura" value={fatChange} unit="%" inverse />
          </View>
        </View>
      )}

      {/* WEIGHT CHART */}
      {inbody.length >= 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolução do Peso</Text>
          <Svg width={chartW} height={chartH + 20} style={{ marginTop: 10 }}>
            <Line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={colors.border} strokeWidth={1} />
            {inbody.length >= 2 && (
              <Polyline
                points={pts}
                fill="none"
                stroke={colors.orange}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {inbody.map((m, i) => {
              const x = inbody.length < 2 ? chartW / 2 : (i / (inbody.length - 1)) * chartW;
              const y = chartH - ((m.weight - minW) / (maxW - minW)) * chartH;
              return (
                <React.Fragment key={i}>
                  <Circle cx={x} cy={y} r={5} fill={colors.orange} />
                  <SvgText x={x} y={y - 10} fontSize={10} fill={colors.muted} textAnchor="middle">{m.weight}</SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
          <View style={styles.chartLabels}>
            {inbody.map((m) => (
              <Text key={m.id} style={styles.chartLabel}>{formatDateShort(m.date)}</Text>
            ))}
          </View>
        </View>
      )}

      {/* PRs */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Records Pessoais 🏆</Text>
        {Object.entries(store.prs).filter(([, v]) => v > 0).map(([ex, w]) => (
          <View key={ex} style={styles.prRow}>
            <Text style={styles.prName}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</Text>
            <Text style={styles.prVal}>{w}kg</Text>
          </View>
        ))}
      </View>

      {/* ADD INBODY */}
      <TouchableOpacity style={styles.addInBodyBtn} onPress={() => {
        store.addInBody({ date: new Date().toISOString().split('T')[0], weight: 83, muscle: 37.5, fatPct: 22, bmi: 29.8, visc: 7 });
        Alert.alert('✅ Avaliação adicionada!', 'Substitua pelos seus dados reais no código.');
      }}>
        <Text style={styles.addInBodyTxt}>+ Adicionar Avaliação InBody</Text>
      </TouchableOpacity>
    </>
  );
}

function ConsistenciaTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { days, fastingSessions } = store;
  const workoutDays = Object.values(days).filter((d) => d.workoutDone).length;
  const streak = store.computeStreak();
  const fastingCompleted = fastingSessions.filter((f) => f.completed).length;

  const best7 = (() => {
    let best = 0;
    const keys = Object.keys(days).sort();
    for (let i = 0; i < keys.length; i++) {
      let count = 0;
      for (let j = i; j < Math.min(i + 7, keys.length); j++) {
        if (days[keys[j]]?.workoutDone) count++;
      }
      best = Math.max(best, count);
    }
    return best;
  })();

  return (
    <>
      <View style={styles.statsRow}>
        <StatBox label="Total Treinos" value={workoutDays} icon="🏋️" />
        <StatBox label="Sequência Atual" value={streak} icon="🔥" />
        <StatBox label="Jejuns OK" value={fastingCompleted} icon="⏱️" />
      </View>
      <View style={styles.statsRow}>
        <StatBox label="Melhor Semana" value={best7} icon="⭐" subtitle="/ 7 dias" />
        <StatBox label="% Semana" value={`${Math.round((workoutDays / Math.max(1, Object.keys(days).length)) * 100)}%`} icon="📊" />
      </View>
      <HeatmapGrid days={days} />
    </>
  );
}

function FotosTab({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { photos } = store;
  const [filterType, setFilterType] = useState<'all' | 'front' | 'side' | 'back'>('all');

  const filtered = filterType === 'all' ? photos : photos.filter((p) => p.type === filterType);

  const pickPhoto = async (type: 'front' | 'side' | 'back') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para adicionar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      store.addPhoto({
        uri: result.assets[0].uri,
        date: new Date().toISOString().split('T')[0],
        type,
        weight: null,
      });
    }
  };

  const TYPE_LABELS = { front: 'Frente', side: 'Lado', back: 'Costas' };

  return (
    <>
      <View style={styles.addPhotoBtns}>
        {(['front', 'side', 'back'] as const).map((t) => (
          <TouchableOpacity key={t} style={styles.addPhotoBtn} onPress={() => pickPhoto(t)}>
            <Text style={styles.addPhotoBtnIcon}>📷</Text>
            <Text style={styles.addPhotoBtnTxt}>{TYPE_LABELS[t]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'front', 'side', 'back'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filterType === f && styles.filterBtnActive]}
            onPress={() => setFilterType(f)}
          >
            <Text style={[styles.filterBtnTxt, filterType === f && { color: colors.orange }]}>
              {f === 'all' ? 'Todas' : TYPE_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyPhotos}>
          <Text style={styles.emptyPhotosIcon}>📸</Text>
          <Text style={styles.emptyPhotosTxt}>Nenhuma foto adicionada</Text>
          <Text style={styles.emptyPhotosSub}>Adicione suas fotos de progresso acima</Text>
        </View>
      ) : (
        <View style={styles.photoGrid}>
          {filtered.map((photo) => (
            <View key={photo.id} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photoImg} />
              <View style={styles.photoInfo}>
                <Text style={styles.photoDate}>{formatDateShort(photo.date)}</Text>
                <Text style={styles.photoType}>{TYPE_LABELS[photo.type as keyof typeof TYPE_LABELS]}</Text>
              </View>
              <TouchableOpacity style={styles.photoDelete} onPress={() => {
                Alert.alert('Excluir foto?', 'Esta ação não pode ser desfeita.', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Excluir', style: 'destructive', onPress: () => store.removePhoto(photo.id) },
                ]);
              }}>
                <Text style={styles.photoDeleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function InBodyCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.inbodyCell}>
      <Text style={styles.inbodyCellLbl}>{label}</Text>
      <Text style={[styles.inbodyCellVal, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

function ChangeCard({ label, value, unit, inverse }: { label: string; value: number; unit: string; inverse?: boolean }) {
  const positive = inverse ? value < 0 : value > 0;
  const color = value === 0 ? colors.muted : positive ? colors.green : colors.red;
  const sign = value > 0 ? '+' : '';
  return (
    <View style={styles.changeCard}>
      <Text style={styles.changeLabel}>{label}</Text>
      <Text style={[styles.changeVal, { color }]}>{sign}{value.toFixed(1)}{unit}</Text>
    </View>
  );
}

function StatBox({ label, value, icon, subtitle }: { label: string; value: number | string; icon: string; subtitle?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxIcon}>{icon}</Text>
      <Text style={styles.statBoxVal}>{value}{subtitle && <Text style={styles.statBoxSub}>{subtitle}</Text>}</Text>
      <Text style={styles.statBoxLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  subTabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface1,
  },
  subTab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  subTabActive: { borderBottomWidth: 2, borderBottomColor: colors.orange },
  subTabTxt: { fontSize: 13, fontWeight: '600', color: colors.muted },
  subTabTxtActive: { color: colors.orange, fontWeight: '800' },
  scroll: { flex: 1 },
  pad: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: 11, color: colors.muted, marginTop: 2, marginBottom: 14 },
  inbodyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  inbodyCell: {
    flex: 1, minWidth: '30%', backgroundColor: colors.surface2,
    borderRadius: 10, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  inbodyCellLbl: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase' },
  inbodyCellVal: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 },
  changesRow: { flexDirection: 'row', gap: 8 },
  changeCard: {
    flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  changeLabel: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase' },
  changeVal: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  chartLabel: { fontSize: 10, color: colors.muted },
  prRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  prName: { fontSize: 14, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  prVal: { fontSize: 16, fontWeight: '800', color: colors.yellow },
  addInBodyBtn: {
    backgroundColor: colors.surface2, borderRadius: radius.md, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  addInBodyTxt: { fontSize: 14, fontWeight: '700', color: colors.orange },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1, backgroundColor: colors.surface1, borderRadius: radius.md, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 4,
  },
  statBoxIcon: { fontSize: 20 },
  statBoxVal: { fontSize: 22, fontWeight: '800', color: colors.text },
  statBoxSub: { fontSize: 13, color: colors.muted },
  statBoxLbl: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },
  addPhotoBtns: { flexDirection: 'row', gap: 8 },
  addPhotoBtn: {
    flex: 1, backgroundColor: colors.surface1, borderRadius: radius.md, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', gap: 6,
  },
  addPhotoBtnIcon: { fontSize: 24 },
  addPhotoBtnTxt: { fontSize: 12, fontWeight: '700', color: colors.orange },
  filterRow: { flexDirection: 'row', gap: 6 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.orangeDim, borderColor: colors.orange },
  filterBtnTxt: { fontSize: 12, fontWeight: '600', color: colors.muted },
  emptyPhotos: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 40,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  emptyPhotosIcon: { fontSize: 40 },
  emptyPhotosTxt: { fontSize: 15, fontWeight: '700', color: colors.muted },
  emptyPhotosSub: { fontSize: 12, color: colors.muted2, textAlign: 'center' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoItem: { width: '48%', backgroundColor: colors.surface1, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  photoImg: { width: '100%', aspectRatio: 3 / 4 },
  photoInfo: { padding: 8, flexDirection: 'row', justifyContent: 'space-between' },
  photoDate: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  photoType: { fontSize: 11, color: colors.orange, fontWeight: '700' },
  photoDelete: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  photoDeleteTxt: { fontSize: 10, color: colors.red, fontWeight: '700' },
});
