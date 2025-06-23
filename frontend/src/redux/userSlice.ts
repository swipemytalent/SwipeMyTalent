import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  avatar?: string;
  bio?: string;
}

const initialState: UserState = {
  id: '',
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  avatar: '',
  bio: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
