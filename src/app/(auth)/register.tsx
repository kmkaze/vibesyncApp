import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import AnimatedButton from '@/components/AnimatedButton';

type Role = 'client' | 'provider';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'Mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      router.replace('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al registrarse.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Ionicons name="musical-notes" size={40} color="#6c63ff" />
            <Text style={styles.title}>VibeSyncApp</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear cuenta</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor="#666"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.roleLabel}>¿Cómo vas a usar VibeSyncApp?</Text>
            <View style={styles.roleRow}>
              {(['client', 'provider'] as Role[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                  onPress={() => setRole(r)}
                >
                  <Ionicons
                    name={r === 'client' ? 'search-outline' : 'briefcase-outline'}
                    size={20}
                    color={role === r ? '#fff' : '#aaa'}
                  />
                  <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                    {r === 'client' ? 'Busco servicios' : 'Ofrezco servicios'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AnimatedButton onPress={handleRegister} loading={loading} style={styles.btn}>
              <Text style={styles.btnText}>Registrarme</Text>
            </AnimatedButton>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" style={styles.link}>Inicia sesión</Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 8 },
  card: { backgroundColor: '#1e1e3a', borderRadius: 20, padding: 24 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2a2a4a', borderRadius: 12,
    marginBottom: 14, paddingHorizontal: 14, height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  eyeBtn: { padding: 4 },
  roleLabel: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#2a2a4a', borderRadius: 12,
    paddingVertical: 12, borderWidth: 2, borderColor: 'transparent',
  },
  roleBtnActive: { backgroundColor: '#3d3680', borderColor: '#6c63ff' },
  roleBtnText: { color: '#aaa', fontSize: 13, fontWeight: '500' },
  roleBtnTextActive: { color: '#fff' },
  btn: {
    backgroundColor: '#6c63ff', borderRadius: 12,
    height: 50, justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#aaa', fontSize: 14 },
  link: { color: '#6c63ff', fontSize: 14, fontWeight: '600' },
});
