import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

interface Props {
  serviceId: number;
  onSuccess: () => void;
}

export default function ReviewForm({ serviceId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Selecciona entre 1 y 5 estrellas.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reviews', { service_id: serviceId, rating, comment });
      setRating(0);
      setComment('');
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al publicar la reseña.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deja tu reseña</Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={30}
              color={star <= rating ? '#f5c518' : '#555'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Comparte tu experiencia (opcional)"
        placeholderTextColor="#666"
        multiline
        numberOfLines={3}
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Publicar reseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1e1e3a', borderRadius: 16, padding: 16, marginVertical: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  starBtn: { padding: 2 },
  input: {
    backgroundColor: '#2a2a4a', borderRadius: 10,
    color: '#fff', padding: 12, fontSize: 14,
    minHeight: 70, textAlignVertical: 'top', marginBottom: 12,
  },
  btn: {
    backgroundColor: '#6c63ff', borderRadius: 10,
    height: 46, justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
