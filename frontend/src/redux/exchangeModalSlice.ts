import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExchangeModalState {
  isOpen: boolean;
  exchangeId: number | null;
}

const initialState: ExchangeModalState = {
  isOpen: false,
  exchangeId: null,
};

const exchangeModalSlice = createSlice({
  name: 'exchangeModal',
  initialState,
  reducers: {
    openExchangeModal: (state, action: PayloadAction<number>) => {
      state.isOpen = true;
      state.exchangeId = action.payload;
    },
    closeExchangeModal: (state) => {
      state.isOpen = false;
      state.exchangeId = null;
    },
  },
});

export const { openExchangeModal, closeExchangeModal } = exchangeModalSlice.actions;
export default exchangeModalSlice.reducer; 