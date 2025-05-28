import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import viewedProfileReducer from './viewedProfileSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    viewedProfile: viewedProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
