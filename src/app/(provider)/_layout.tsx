import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function ProviderLayout() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#2a2a4a' },
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="my-services"
        options={{
          title: 'Mis Servicios',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-service"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="edit-service/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
