import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { RingProgress } from '../components/RingProgress';
import { colors, radius } from '../constants/theme';
import { Meal } from '../types';

const WATER_PRESETS = [250, 350, 500];

const QUICK_MEALS = [
  { name: 'Frango + Arroz', calories: 450, protein: 40, carbs: 50, fat: 8 },
  { name: 'Omelete 3 ovos', calories: 220, protein: 18, carbs: 2, fat: 15 },
  { name: 'Whey Protein', calories: 130, protein: 25, carbs: 5, fat: 2 },
  { name: 'Batata Doce', calories: 180, protein: 2, carbs: 42, fat: 0 },
  { name: 'Aveia + Banana', calories: 290, protein: 8, carbs: 56, fat: 4 },
  { name: 'Atum + Torrada', calories: 200, protein: 24, carbs: 20, fat: 3 },
];

export function DietaScreen() {
  const store = useAppStore();
  const today = store.getToday();
  const [addMealVisible, setAddMealVisible] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealCal, setMealCal] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');
  const [isCheat, setIsCheat] = useState(false);

  const openEdit = (meal: Meal) => {
    setEditingMealId(meal.id);
    setMealName(meal.name);
    setMealCal(String(meal.calories));
    setMealProtein(String(meal.protein));
    setMealCarbs(String(meal.carbs));
    setMealFat(String(meal.fat));
    setIsCheat(meal.isCheat);
    setAddMealVisible(true);
  };

  const openAdd = () => {
    setEditingMealId(null);
    setMealName(''); setMealCal(''); setMealProtein('');
    setMealCarbs(''); setMealFat(''); setIsCheat(false);
    setAddMealVisible(true);
  };

  const totalCal = today.meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = today.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = today.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = today.meals.reduce((s, m) => s + m.fat, 0);
  const waterL = today.waterMl / 1000;
  const waterGoalL = store.waterGoalMl / 1000;
  const calPct = Math.min(1, totalCal / store.calorieGoal);
  const proteinPct = Math.min(1, totalProtein / store.proteinGoal);
  const waterPct = Math.min(1, today.waterMl / store.waterGoalMl);

  const addMeal = (quick?: typeof QUICK_MEALS[0]) => {
    if (quick) {
      const meal: Meal = {
        id: Date.now().toString(),
        name: quick.name,
        calories: quick.calories,
        protein: quick.protein,
        carbs: quick.carbs,
        fat: quick.fat,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isCheat: false,
      };
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      store.addMeal(meal);
      return;
    }
    if (!mealName || !mealCal) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editingMealId) {
      store.updateMeal(editingMealId, {
        name: mealName,
        calories: parseInt(mealCal) || 0,
        protein: parseInt(mealProtein) || 0,
        carbs: parseInt(mealCarbs) || 0,
        fat: parseInt(mealFat) || 0,
        isCheat,
      });
    } else {
      const meal: Meal = {
        id: Date.now().toString(),
        name: mealName,
        calories: parseInt(mealCal) || 0,
        protein: parseInt(mealProtein) || 0,
        carbs: parseInt(mealCarbs) || 0,
        fat: parseInt(mealFat) || 0,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isCheat,
      };
      store.addMeal(meal);
    }
    setMealName(''); setMealCal(''); setMealProtein('');
    setMealCarbs(''); setMealFat(''); setIsCheat(false);
    setEditingMealId(null);
    setAddMealVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nutrição</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnTxt}>+ Refeição</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pad}>

          {/* MACRO RINGS */}
          <View style={styles.macroCard}>
            <View style={styles.macroRings}>
              <RingProgress size={92} strokeWidth={8} progress={calPct} gradient
                value={`${totalCal}`} unit="kcal" label="Calorias" sublabel={`/${store.calorieGoal}`} />
              <RingProgress size={92} strokeWidth={8} progress={proteinPct} color={colors.blue}
                value={`${totalProtein}g`} unit="" label="Proteína" sublabel={`/${store.proteinGoal}g`} />
              <RingProgress size={92} strokeWidth={8} progress={waterPct} color={colors.teal}
                value={`${waterL.toFixed(1)}L`} unit="" label="Água" sublabel={`/${waterGoalL}L`} />
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillLbl}>Carbs</Text>
                <Text style={styles.macroPillVal}>{totalCarbs}g</Text>
              </View>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillLbl}>Gordura</Text>
                <Text style={styles.macroPillVal}>{totalFat}g</Text>
              </View>
              <View style={[styles.macroPill, { backgroundColor: calPct > 1 ? colors.redDim : colors.orangeDim }]}>
                <Text style={styles.macroPillLbl}>Saldo</Text>
                <Text style={[styles.macroPillVal, { color: calPct > 1 ? colors.red : colors.orange }]}>
                  {store.calorieGoal - totalCal} kcal
                </Text>
              </View>
            </View>
          </View>

          {/* WATER */}
          <View style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <Text style={styles.waterTitle}>💧 Hidratação</Text>
              <Text style={styles.waterVal}>{waterL.toFixed(2)}L / {waterGoalL}L</Text>
            </View>
            <View style={styles.waterBar}>
              <View style={[styles.waterFill, { width: `${Math.round(waterPct * 100)}%` as any }]} />
            </View>
            <View style={styles.waterBtns}>
              {WATER_PRESETS.map((ml) => (
                <TouchableOpacity
                  key={ml}
                  style={styles.waterBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); store.addWater(ml); }}
                >
                  <Text style={styles.waterBtnTxt}>+{ml}ml</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.waterBtn, { backgroundColor: colors.redDim }]}
                onPress={() => store.setWater(0)}>
                <Text style={[styles.waterBtnTxt, { color: colors.red }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* QUICK ADD */}
          <Text style={styles.sectionLabel}>Refeições Rápidas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {QUICK_MEALS.map((m) => (
              <TouchableOpacity key={m.name} style={styles.quickCard} onPress={() => addMeal(m)}>
                <Text style={styles.quickName}>{m.name}</Text>
                <Text style={styles.quickCal}>{m.calories} kcal</Text>
                <Text style={styles.quickProt}>{m.protein}g prot</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* MEAL LOG */}
          <Text style={styles.sectionLabel}>Refeições de Hoje ({today.meals.length})</Text>
          {today.meals.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>Nenhuma refeição registrada</Text>
              <Text style={styles.emptySub}>Adicione suas refeições acima</Text>
            </View>
          ) : (
            today.meals.map((meal) => (
              <View key={meal.id} style={[styles.mealCard, meal.isCheat && styles.mealCheat]}>
                <View style={styles.mealLeft}>
                  <View style={styles.mealRow}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    {meal.isCheat && <View style={styles.cheatBadge}><Text style={styles.cheatTxt}>Cheat</Text></View>}
                  </View>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <View style={styles.mealMacros}>
                    <Text style={styles.mealMacro}>P {meal.protein}g</Text>
                    <Text style={styles.mealMacro}>C {meal.carbs}g</Text>
                    <Text style={styles.mealMacro}>G {meal.fat}g</Text>
                  </View>
                </View>
                <View style={styles.mealRight}>
                  <Text style={styles.mealCal}>{meal.calories}</Text>
                  <Text style={styles.mealCalLbl}>kcal</Text>
                  <View style={styles.mealActions}>
                    <TouchableOpacity onPress={() => openEdit(meal)} style={styles.editBtn}>
                      <Text style={styles.editBtnTxt}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => store.removeMeal(meal.id)}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ADD MEAL MODAL */}
      <Modal visible={addMealVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingMealId ? '✏️ Editar Refeição' : 'Nova Refeição'}</Text>
            <TextInput style={styles.input} placeholder="Nome da refeição" placeholderTextColor={colors.muted}
              value={mealName} onChangeText={setMealName} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Calorias" placeholderTextColor={colors.muted}
                keyboardType="numeric" value={mealCal} onChangeText={setMealCal} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Proteína (g)" placeholderTextColor={colors.muted}
                keyboardType="numeric" value={mealProtein} onChangeText={setMealProtein} />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Carbs (g)" placeholderTextColor={colors.muted}
                keyboardType="numeric" value={mealCarbs} onChangeText={setMealCarbs} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Gordura (g)" placeholderTextColor={colors.muted}
                keyboardType="numeric" value={mealFat} onChangeText={setMealFat} />
            </View>
            <TouchableOpacity style={[styles.cheatToggle, isCheat && styles.cheatToggleActive]}
              onPress={() => setIsCheat(!isCheat)}>
              <Text style={[styles.cheatToggleTxt, isCheat && { color: colors.red }]}>
                {isCheat ? '🍔 Cheat meal' : '🥗 Refeição normal'}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => { setAddMealVisible(false); setEditingMealId(null); }}>
                <Text style={styles.btnSecondaryTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => addMeal()}>
                <Text style={styles.btnPrimaryTxt}>{editingMealId ? 'Salvar' : 'Adicionar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  addBtn: { backgroundColor: colors.orange, borderRadius: 50, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pad: { padding: 16, gap: 12 },
  macroCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  macroRings: { flexDirection: 'row', justifyContent: 'space-around' },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroPill: {
    flex: 1, backgroundColor: colors.surface2, borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  macroPillLbl: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase' },
  macroPillVal: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  waterCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 10,
  },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  waterVal: { fontSize: 13, color: colors.teal, fontWeight: '600' },
  waterBar: { height: 5, backgroundColor: colors.surface3, borderRadius: 3, overflow: 'hidden' },
  waterFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 3 },
  waterBtns: { flexDirection: 'row', gap: 8 },
  waterBtn: {
    flex: 1, backgroundColor: 'rgba(90,200,250,0.08)', borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(90,200,250,0.2)',
  },
  waterBtnTxt: { fontSize: 12, fontWeight: '700', color: colors.teal },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted },
  quickScroll: { marginBottom: 4 },
  quickCard: {
    backgroundColor: colors.surface2, borderRadius: radius.md, padding: 12, marginRight: 10,
    borderWidth: 1, borderColor: colors.border, minWidth: 120,
  },
  quickName: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 },
  quickCal: { fontSize: 14, fontWeight: '800', color: colors.orange },
  quickProt: { fontSize: 11, color: colors.muted, marginTop: 2 },
  empty: { backgroundColor: colors.surface1, borderRadius: radius.md, padding: 24, alignItems: 'center', gap: 6 },
  emptyTxt: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  emptySub: { fontSize: 12, color: colors.muted2 },
  mealCard: {
    backgroundColor: colors.surface1, borderRadius: radius.md, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between',
  },
  mealCheat: { borderColor: `${colors.red}40`, backgroundColor: colors.redDim },
  mealLeft: { flex: 1, gap: 3 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealName: { fontSize: 14, fontWeight: '700', color: colors.text },
  cheatBadge: { backgroundColor: colors.redDim, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  cheatTxt: { fontSize: 9, fontWeight: '700', color: colors.red },
  mealTime: { fontSize: 11, color: colors.muted },
  mealMacros: { flexDirection: 'row', gap: 8 },
  mealMacro: { fontSize: 11, color: colors.muted2, fontWeight: '600' },
  mealRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 2 },
  mealCal: { fontSize: 22, fontWeight: '800', color: colors.orange },
  mealCalLbl: { fontSize: 10, color: colors.muted, textTransform: 'uppercase' },
  mealActions: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  editBtn: { padding: 2 },
  editBtnTxt: { fontSize: 14 },
  deleteBtn: { fontSize: 16, color: colors.muted2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface1, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: colors.border, gap: 12,
    alignItems: 'stretch',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.surface4,
    alignSelf: 'center', marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  input: {
    backgroundColor: colors.surface2, borderRadius: 12, padding: 14,
    color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  inputRow: { flexDirection: 'row', gap: 10 },
  cheatToggle: {
    backgroundColor: colors.surface2, borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  cheatToggleActive: { backgroundColor: colors.redDim, borderColor: `${colors.red}60` },
  cheatToggleTxt: { fontSize: 14, fontWeight: '700', color: colors.muted },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnSecondary: { flex: 1, backgroundColor: colors.surface2, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnSecondaryTxt: { fontSize: 15, fontWeight: '700', color: colors.text },
  btnPrimary: { flex: 1, backgroundColor: colors.orange, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
