import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'http://192.168.1.14:3000/api';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'provider' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  location: string;
  schedule: string;
  contact_phone: string;
  contact_email: string;
  category_id: number;
  category_name: string;
  provider_name: string;
  rating: number | null;
  review_count: number;
  cover_image: string | null;
  created_at: string;
}

export interface AdminService extends Service {
  status: 'pending' | 'active' | 'inactive';
  provider_email: string;
}

export interface ServiceDetail extends Service {
  user_id: number;
  provider_email: string;
  status: string;
}

export interface ServiceImage {
  image_url: string;
  sort_order: number;
}

export interface Review {
  rating: number;
  comment: string;
  created_at: string;
  author: string;
}

export interface AdminStats {
  total_clients: string;
  total_providers: string;
  active_services: string;
  pending_services: string;
  total_reviews: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedServices {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
}
