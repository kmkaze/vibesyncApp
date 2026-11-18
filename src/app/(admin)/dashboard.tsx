import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, AdminStats, AdminUser } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData() {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get<{ stats: AdminStats }>('/admin/stats'),
        api.get<{ users: AdminUser[] }>('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users.slice(0, 5));
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#6c63ff" />}
    >
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Panel Admin</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6c63ff" />
      ) : (
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Resumen general</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="people-outline" label="Clientes" value={stats?.total_clients ?? '0'} color="#6c63ff" />
            <StatCard icon="briefcase-outline" label="Proveedores" value={stats?.total_providers ?? '0'} color="#22c55e" />
            <StatCard icon="checkmark-circle-outline" label="Servicios activos" value={stats?.active_services ?? '0'} color="#22c55e" />
            <StatCard icon="time-outline" label="Pendientes" value={stats?.pending_services ?? '0'} color="#f59e0b" />
            <StatCard icon="star-outline" label="Reseñas" value={stats?.total_reviews ?? '0'} color="#f5c518" />
          </View>

          <Text style={styles.sectionTitle}>Últimos usuarios registrados</Text>
          {users.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{u.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: u.role === 'provider' ? '#22c55e22' : '#6c63ff22' }]}>
                <Text style={[styles.roleBadgeText, { color: u.role === 'provider' ? '#22c55e' : '#6c63ff' }]}>
                  {u.role === 'provider' ? 'Proveedor' : 'Cliente'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#aaa', marginTop: 2 },
  logoutBtn: { padding: 8 },
  loader: { marginTop: 60 },
  body: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 14, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%', backgroundColor: '#1e1e3a', borderRadius: 14,
    padding: 16, borderLeftWidth: 4,
  },
  statIcon: { marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#aaa', marginTop: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1e1e3a', borderRadius: 12, padding: 12, marginBottom: 8 },
  userAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  userName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  userEmail: { color: '#aaa', fontSize: 12 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText: { fontSize: 11, fontWeight: '600' },
});
