import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

const CATEGORIES = [
  { id: 1, name: 'Música en vivo' },
  { id: 2, name: 'DJ' },
  { id: 3, name: 'Banda' },
  { id: 4, name: 'Solista' },
  { id: 5, name: 'Coro / Coral' },
  { id: 6, name: 'Clases de música' },
  { id: 7, name: 'Producción musical' },
  { id: 8, name: 'Sonido y técnica' },
];

export default function CreateService() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !categoryId) {
      Alert.alert('Campos requeridos', 'El título y la categoría son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/services', {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        location: location.trim(),
        schedule: schedule.trim(),
        contact_phone: phone.trim(),
        contact_email: email.trim(),
      });
      Alert.alert('¡Listo!', 'Servicio creado. Quedará activo luego de revisión del administrador.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al crear el servicio.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo servicio</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.label}>Título *</Text>
        <TextInput style={styles.input} placeholder="Ej: Banda de jazz para eventos" placeholderTextColor="#666" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Describe tu servicio..." placeholderTextColor="#666" multiline numberOfLines={4} value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.categoryChipText, categoryId === cat.id && styles.categoryChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ubicación</Text>
        <TextInput style={styles.input} placeholder="Ciudad o región" placeholderTextColor="#666" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Horario / Disponibilidad</Text>
        <TextInput style={styles.input} placeholder="Ej: Lunes a viernes, 8am–6pm" placeholderTextColor="#666" value={schedule} onChangeText={setSchedule} />

        <Text style={styles.label}>Teléfono de contacto</Text>
        <TextInput style={styles.input} placeholder="+57 300 000 0000" placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Email de contacto</Text>
        <TextInput style={styles.input} placeholder="contacto@ejemplo.com" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Publicar servicio</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  label: { color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#1e1e3a', borderRadius: 12, color: '#fff', padding: 14, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1e1e3a', borderRadius: 20, borderWidth: 1.5, borderColor: 'transparent' },
  categoryChipActive: { backgroundColor: '#3d3680', borderColor: '#6c63ff' },
  categoryChipText: { color: '#aaa', fontSize: 13 },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#6c63ff', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
