// store.js
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slice/appSlice'; // Import your reducer
import dbReducer from './slice/dbSlice'; // Import your reducer

const store = configureStore({
    reducer: {
        app: appReducer,
        db: dbReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['db.lastVisibleTransaction'],
                ignoredActions: ['db/setTransactions', 'db/appendTransactions'],
            },
        }),
});

export default store;
