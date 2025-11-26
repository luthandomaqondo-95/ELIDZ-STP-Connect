import { configureStore } from '@reduxjs/toolkit';
import generalReducer from './slices/generalSlice';
// import authReducer from './slices/authSlice';
// import emailReducer from './slices/emailSlice';
// import messagingReducer from './slices/messagingSlice';
// import uiReducer from './slices/uiSlice';
// import userReducer from './slices/userSlice';
// import paymentsReducer from './slices/paymentsSlice';

export const store = configureStore({
	reducer: {
		general: generalReducer,
		// email: emailReducer,
		// auth: authReducer,
		// user: userReducer,
		// ui: uiReducer,
		// messaging: messagingReducer,
		// payments: paymentsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch; 