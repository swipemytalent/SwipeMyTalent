import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import viewedProfileReducer from './viewedProfileSlice';
import messagingReducer from './messagingSlice';
import exchangeModalReducer from './exchangeModalSlice';
import forumReducer from './forumSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    viewedProfile: viewedProfileReducer,
    messaging: messagingReducer,
    exchangeModal: exchangeModalReducer,
    forum: forumReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
