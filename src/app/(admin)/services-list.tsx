import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, AdminService } from '@/services/api';

type StatusFilter = 'all' | 'pending' | 'active' | 'inactive';

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  pending: '#f59e0b',
  inactive: '#ef4444',
};

export default function ServicesList() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchServices(status?: string) {
    try {
      const params = status && status !== 'all' ? { status } : {};
      const res = await api.get<{ services: AdminService[] }>('/admin/services', { params });
      setServices(res.data.services);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchServices(filter);
  }, [filter]));

  async function changeStatus(id: number, status: 'active' | 'inactive') {
    try {
      await api.patch(`/admin/services/${id}/status`, { status });
      fetchServices(filter);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar el estado.');
    }
  }

  async function handleDelete(id: number) {
    Alert.alert('Eliminar', '¿Eliminar este servicio permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/services/${id}`);
            fetchServices(filter);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar.');
          }
        },
      },
    ]);
  }

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'active', label: 'Activos' },
    { key: 'inactive', label: 'Inactivos' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <Text style={styles.title}>Gestión de servicios</Text>
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6c63ff" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchServices(filter); }} tintColor="#6c63ff" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="list-outline" size={48} color="#444" />
              <Text style={styles.emptyText}>No hay servicios en este estado</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardProvider}>Por {item.provider_name}</Text>
                  <Text style={styles.cardCategory}>{item.category_name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                {item.status !== 'active' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#22c55e22' }]}
                    onPress={() => changeStatus(item.id, 'active')}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#22c55e" />
                    <Text style={[styles.actionBtnText, { color: '#22c55e' }]}>Aprobar</Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'inactive' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#f59e0b22' }]}
                    onPress={() => changeStatus(item.id, 'inactive')}
                  >
                    <Ionicons name="pause-circle-outline" size={16} color="#f59e0b" />
                    <Text style={[styles.actionBtnText, { color: '#f59e0b' }]}>Desactivar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#ef444422' }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Eliminar</Text>
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
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#2a2a4a', borderRadius: 20 },
  filterChipActive: { backgroundColor: '#6c63ff' },
  filterText: { color: '#aaa', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  loader: { marginTop: 60 },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: '#666', fontSize: 15 },
  card: { backgroundColor: '#1e1e3a', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cardProvider: { fontSize: 13, color: '#aaa' },
  cardCategory: { fontSize: 12, color: '#6c63ff', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
});
