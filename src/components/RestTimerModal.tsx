import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Vibration, Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, radius, typography } from '../constants/theme';

interface Props {
  visible: boolean;
  duration: number;
  exerciseName?: string;
  onClose: () => void;
  onComplete?: () => void;
}

const PRESETS = [30, 45, 60, 90, 120, 180];

export function RestTimerModal({ visible, duration, exerciseName, onClose, onComplete }: Props) {
  const [remaining, setRemaining] = useState(duration);
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animProg = useRef(new Animated.Value(0)).current;

  const SIZE = 220;
  const SW = 14;
  const R = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;

  const strokeDashoffset = animProg.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, 0],
  });

  const reset = useCallback((dur: number) => {
    clearInterval(intervalRef.current!);
    setCurrentDuration(dur);
    setRemaining(dur);
    setRunning(true);
    animProg.setValue(0);
  }, [animProg]);

  useEffect(() => {
    if (visible) reset(duration);
    return () => clearInterval(intervalRef.current!);
  }, [visible, duration]);

  useEffect(() => {
    if (!running || !visible) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        Animated.timing(animProg, {
          toValue: 1 - next / currentDuration,
          duration: 900,
          useNativeDriver: false,
        }).start();
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Vibration.vibrate([300, 100, 300, 100, 300]);
          }
          onComplete?.();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running, visible, currentDuration]);

  const mins = Math.floor(Math.abs(remaining) / 60);
  const secs = Math.abs(remaining) % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const done = remaining <= 0;

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Descanso</Text>
          {exerciseName && <Text style={styles.subtitle}>{exerciseName}</Text>}

          <View style={styles.ringWrap}>
            <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
              <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
                stroke={done ? colors.green : colors.orange}
                strokeWidth={SW} strokeDasharray={CIRC}
                strokeDashoffset={strokeDashoffset as any}
                strokeLinecap="round" />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={[styles.time, done && { color: colors.green }]}>{timeStr}</Text>
              <Text style={styles.timeLbl}>{done ? 'Pronto! 💪' : 'restando'}</Text>
            </View>
          </View>

          <View style={styles.presets}>
            {PRESETS.map((s) => (
              <TouchableOpacity key={s} style={[styles.preset, currentDuration === s && styles.presetActive]}
                onPress={() => reset(s)}>
                <Text style={[styles.presetTxt, currentDuration === s && { color: colors.orange }]}>
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnSecondary}
              onPress={() => setRunning((r) => !r)}>
              <Text style={styles.btnSecondaryTxt}>{running ? 'Pausar' : 'Retomar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={onClose}>
              <Text style={styles.btnPrimaryTxt}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface1,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  title: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.muted },
  subtitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4, textAlign: 'center' },
  ringWrap: { marginVertical: 24, position: 'relative' },
  ringCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  time: { fontSize: 52, fontWeight: '800', color: colors.text, letterSpacing: -2 },
  timeLbl: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  presets: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  preset: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 50, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  presetActive: { borderColor: colors.orange, backgroundColor: colors.orangeDim },
  presetTxt: { fontSize: 13, fontWeight: '700', color: colors.muted },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  btnSecondary: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: colors.surface3, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  btnSecondaryTxt: { fontSize: 15, fontWeight: '700', color: colors.text },
  btnPrimary: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: colors.orange, alignItems: 'center',
  },
  btnPrimaryTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
