import { useRef } from 'react';
import { Animated, Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export default function AnimatedButton({ onPress, loading, disabled, style, children }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.94, speed: 50, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 60, useNativeDriver: true }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          style,
          { transform: [{ scale }], opacity: disabled ? 0.55 : 1 },
        ]}
      >
        {loading ? <ActivityIndicator color="#fff" /> : children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
