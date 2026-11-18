import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, Service } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

type ProviderService = Service & { status: 'pending' | 'active' | 'inactive' };

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  pending: '#f59e0b',
  inactive: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  inactive: 'Inactivo',
};

export default function MyServices() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchMyServices() {
    try {
      const res = await api.get<{ services: ProviderService[] }>('/services/my/list');
      setServices(res.data.services);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchMyServices();
  }, []));

  async function handleDelete(id: number) {
    Alert.alert('Eliminar servicio', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/services/${id}`);
            fetchMyServices();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el servicio.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.subtitle}>Tus servicios publicados</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6c63ff" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyServices(); }} tintColor="#6c63ff" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color="#444" />
              <Text style={styles.emptyText}>No tienes servicios aún</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(provider)/create-service')}>
                <Text style={styles.createBtnText}>Crear mi primer servicio</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCategory}>{item.category_name}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="star" size={12} color="#f5c518" />
                <Text style={styles.cardMetaText}>
                  {item.rating ? Number(item.rating).toFixed(1) : 'Sin calificación'} ({item.review_count} reseñas)
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push(`/(provider)/edit-service/${item.id}`)}
                >
                  <Ionicons name="pencil-outline" size={16} color="#6c63ff" />
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#aaa', marginTop: 2 },
  logoutBtn: { padding: 8 },
  loader: { flex: 1, marginTop: 60 },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: '#666', fontSize: 15 },
  createBtn: { backgroundColor: '#6c63ff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#1e1e3a', borderRadius: 16, padding: 16, marginBottom: 14 },
  cardHeader: { marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cardCategory: { fontSize: 13, color: '#6c63ff', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  cardMetaText: { color: '#aaa', fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: 10 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2a2a4a', borderRadius: 10, paddingVertical: 10 },
  editBtnText: { color: '#6c63ff', fontWeight: '600', fontSize: 14 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2a1a1a', borderRadius: 10, paddingVertical: 10 },
  deleteBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
});
