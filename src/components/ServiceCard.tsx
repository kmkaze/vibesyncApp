import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Service } from '@/services/api';

interface Props {
  service: Service;
  onPress?: () => void;
}

export default function ServiceCard({ service, onPress }: Props) {
  function handlePress() {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(client)/service/${service.id}`);
    }
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      {service.cover_image ? (
        <Image source={{ uri: service.cover_image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="musical-notes" size={36} color="#6c63ff" />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.category}>{service.category_name}</Text>
        <Text style={styles.title} numberOfLines={2}>{service.title}</Text>
        <Text style={styles.provider} numberOfLines={1}>
          <Ionicons name="person-outline" size={12} color="#aaa" /> {service.provider_name}
        </Text>

        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#f5c518" />
            <Text style={styles.rating}>
              {service.rating ? Number(service.rating).toFixed(1) : 'Nuevo'}
            </Text>
            <Text style={styles.reviewCount}>({service.review_count})</Text>
          </View>
          {service.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#aaa" />
              <Text style={styles.location} numberOfLines={1}>{service.location}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e3a', borderRadius: 16,
    marginBottom: 14, overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  imagePlaceholder: {
    width: '100%', height: 120,
    backgroundColor: '#2a2a4a', justifyContent: 'center', alignItems: 'center',
  },
  body: { padding: 14 },
  category: { fontSize: 11, color: '#6c63ff', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  provider: { fontSize: 13, color: '#aaa', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 13, color: '#fff', fontWeight: '600' },
  reviewCount: { fontSize: 12, color: '#888' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '55%' },
  location: { fontSize: 12, color: '#aaa' },
});
