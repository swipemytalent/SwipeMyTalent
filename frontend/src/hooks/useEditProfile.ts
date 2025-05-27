import { ChangeEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import type { UserState } from '../redux/userSlice';
import { updateUserProfile } from '../api/userApi';

export function useEditProfile(initialUser: UserState) {
  const [editUser, setEditUser] = useState<UserState>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditUser((prev: UserState) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser((prev: UserState) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const updatedUser = await updateUserProfile(editUser, token!);
      dispatch(setUser(updatedUser));
    } catch (err) {
      setError('Image trop grande (taille max 1mb) ou erreur lors de la mise à jour du profil.');
    }
  };

  return { editUser, setEditUser, handleChange, handlePhotoChange, handleSubmit, error };
}