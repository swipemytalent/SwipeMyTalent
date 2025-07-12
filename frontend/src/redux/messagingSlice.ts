import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagingState {
  isOpen: boolean;
  selectedUserId: string | null;
}

const initialState: MessagingState = {
  isOpen: false,
  selectedUserId: null,
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    openMessaging: (state, action: PayloadAction<string | null>) => {
      state.isOpen = true;
      state.selectedUserId = action.payload;
    },
    closeMessaging: (state) => {
      state.isOpen = false;
      state.selectedUserId = null;
    },
    selectUser: (state, action: PayloadAction<string>) => {
      state.selectedUserId = action.payload;
    },
  },
});

export const { openMessaging, closeMessaging, selectUser } = messagingSlice.actions;
export default messagingSlice.reducer; 