import { useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, ServiceDetail, Review, ServiceImage } from '@/services/api';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { useAuth } from '@/hooks/useAuth';

interface ServiceResponse {
  service: ServiceDetail;
  images: ServiceImage[];
  reviews: Review[];
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<ServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchDetail() {
    try {
      const res = await api.get<ServiceResponse>(`/services/${id}`);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchDetail();
  }, [id]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Servicio no disponible</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { service, images, reviews } = data;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDetail(); }} tintColor="#6c63ff" />}
    >
      <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {images.length > 0 ? (
        <Image source={{ uri: images[0].image_url }} style={styles.coverImage} resizeMode="cover" />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="musical-notes" size={56} color="#6c63ff" />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.category}>{service.category_name}</Text>
        <Text style={styles.title}>{service.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color="#aaa" />
          <Text style={styles.metaText}>{service.provider_name}</Text>
          {service.rating ? (
            <>
              <Ionicons name="star" size={13} color="#f5c518" style={{ marginLeft: 10 }} />
              <Text style={styles.metaText}>{Number(service.rating).toFixed(1)} ({service.review_count})</Text>
            </>
          ) : null}
        </View>

        {service.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="#aaa" />
            <Text style={styles.metaText}>{service.location}</Text>
          </View>
        ) : null}

        {service.schedule ? (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#aaa" />
            <Text style={styles.metaText}>{service.schedule}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{service.description || 'Sin descripción.'}</Text>

        <Text style={styles.sectionTitle}>Contacto</Text>
        {service.contact_phone ? (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={14} color="#aaa" />
            <Text style={styles.metaText}>{service.contact_phone}</Text>
          </View>
        ) : null}
        {service.contact_email ? (
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={14} color="#aaa" />
            <Text style={styles.metaText}>{service.contact_email}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Reseñas ({reviews.length})</Text>

        {user?.role === 'client' && (
          <ReviewForm serviceId={service.id} onSuccess={fetchDetail} />
        )}

        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>Aún no hay reseñas. ¡Sé el primero!</Text>
        ) : (
          reviews.map((r, i) => <ReviewCard key={i} review={r} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d1a' },
  errorText: { color: '#fff', fontSize: 16, marginBottom: 16 },
  backBtn: { backgroundColor: '#6c63ff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: '600' },
  backArrow: {
    position: 'absolute', top: 52, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8,
  },
  coverImage: { width: '100%', height: 240 },
  coverPlaceholder: {
    width: '100%', height: 180,
    backgroundColor: '#1e1e3a', justifyContent: 'center', alignItems: 'center',
  },
  body: { padding: 20 },
  category: { fontSize: 12, color: '#6c63ff', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metaText: { color: '#aaa', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 20, marginBottom: 10 },
  description: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  noReviews: { color: '#666', fontSize: 14, textAlign: 'center', marginVertical: 16 },
});
