import { HttpService } from '../services/httpService';
import type { UserState } from '../redux/userSlice';

export async function updateUserProfile(user: UserState): Promise<UserState> {
  return await HttpService.put<UserState>('/profile', user);
}

export async function fetchUserProfile(): Promise<UserState> {
  return await HttpService.get<UserState>('/profile');
}

export async function fetchUsers(): Promise<UserState[]> {
  return await HttpService.get<UserState[]>('/users');
}

export async function fetchUserById(id: string): Promise<UserState> {
  return await HttpService.get<UserState>(`/users/${id}`);
} 