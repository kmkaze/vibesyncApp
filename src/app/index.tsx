import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    switch (user.role) {
      case 'client':
        router.replace('/(client)/explore');
        break;
      case 'provider':
        router.replace('/(provider)/my-services');
        break;
      case 'admin':
        router.replace('/(admin)/dashboard');
        break;
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
      <ActivityIndicator size="large" color="#6c63ff" />
    </View>
  );
}
