import type { UserState } from '../redux/userSlice';

export async function updateUserProfile(user: UserState, token: string) {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(user)
  });
  if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
  return response.json();
}

export async function fetchUserProfile(token: string) {
  const response = await fetch('/api/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Erreur lors de la récupération du profil');
  return response.json();
} 