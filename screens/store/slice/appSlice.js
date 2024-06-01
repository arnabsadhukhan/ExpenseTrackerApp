// exampleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userId: null,
    categories: [],
    transactions: []
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userId = action.payload;
        },

    },
});

export const { setUser } = appSlice.actions;
export default appSlice.reducer;
