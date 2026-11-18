import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '@/services/api';

export default function ReviewCard({ review }: { review: Review }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.author.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{review.author}</Text>
          <View style={styles.starsRow}>
            {stars.map((filled, i) => (
              <Ionicons key={i} name={filled ? 'star' : 'star-outline'} size={13} color="#f5c518" />
            ))}
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(review.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
        </Text>
      </View>
      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e1e3a', borderRadius: 14, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  author: { color: '#fff', fontWeight: '600', fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  date: { color: '#888', fontSize: 12 },
  comment: { color: '#ccc', fontSize: 14, lineHeight: 20 },
});
