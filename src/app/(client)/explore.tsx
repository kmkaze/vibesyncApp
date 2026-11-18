import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, Service, PaginatedServices } from '@/services/api';
import ServiceCard from '@/components/ServiceCard';
import AppLoader from '@/components/AppLoader';
import { useAuth } from '@/hooks/useAuth';

export default function Explore() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = useCallback(async (q = search) => {
    try {
      const params: Record<string, string> = {};
      if (q.trim()) params.search = q.trim();
      const res = await api.get<PaginatedServices>('/services', { params });
      setServices(res.data.services);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchServices();
  }, []));

  function onRefresh() {
    setRefreshing(true);
    fetchServices();
  }

  function onSearch() {
    setLoading(true);
    fetchServices(search);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Encuentra servicios musicales</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchServices(''); }}>
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <AppLoader />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard service={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c63ff" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="musical-notes-outline" size={48} color="#444" />
              <Text style={styles.emptyText}>No se encontraron servicios</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  headerGradient: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#aaa', marginTop: 2 },
  logoutBtn: { padding: 8 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e3a', borderRadius: 14,
    paddingHorizontal: 14, height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  loader: { flex: 1, marginTop: 60 },
  list: { padding: 16 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: '#666', fontSize: 15 },
});
