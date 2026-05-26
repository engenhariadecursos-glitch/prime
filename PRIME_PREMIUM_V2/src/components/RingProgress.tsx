import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  gradient?: boolean;
  label?: string;
  value?: string;
  unit?: string;
  sublabel?: string;
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RingProgress({
  size = 90,
  strokeWidth = 8,
  progress,
  color = colors.orange,
  gradient = false,
  label,
  value,
  unit,
  sublabel,
  animated = true,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const animValue = useRef(new Animated.Value(0)).current;
  const gradId = `grad-${size}-${color.replace('#', '')}`;

  useEffect(() => {
    if (animated) {
      Animated.spring(animValue, {
        toValue: Math.min(1, Math.max(0, progress)),
        tension: 40,
        friction: 8,
        useNativeDriver: false,
      }).start();
    } else {
      animValue.setValue(Math.min(1, Math.max(0, progress)));
    }
  }, [progress]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {gradient && (
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.orange} />
                <Stop offset="1" stopColor={colors.orange2} />
              </LinearGradient>
            </Defs>
          )}
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
        </Svg>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            <AnimatedCircle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={gradient ? `url(#${gradId})` : color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset as any}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
        {(value || label) && (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            {value && <Text style={styles.value}>{value}</Text>}
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
        )}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  unit: { fontSize: 8, color: colors.muted, fontWeight: '600', letterSpacing: 0.3 },
  label: { fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 6 },
  sublabel: { fontSize: 9, color: colors.muted, marginTop: 1 },
});
