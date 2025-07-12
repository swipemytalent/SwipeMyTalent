import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../components/ProfileForm/ProfileForm';

interface ViewedProfileState {
  value: User | null;
}

const initialState: ViewedProfileState = {
  value: null,
};

const viewedProfileSlice = createSlice({
  name: 'viewedProfile',
  initialState,
  reducers: {
    setViewedProfile: (state, action: PayloadAction<User>) => {
      state.value = action.payload;
    },
    clearViewedProfile: (state) => {
      state.value = null;
    },
  },
});

export const { setViewedProfile, clearViewedProfile } = viewedProfileSlice.actions;
export default viewedProfileSlice.reducer; 