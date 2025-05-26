import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  avatar?: string;
}

const initialState: UserState = {
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  avatar: '',
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
