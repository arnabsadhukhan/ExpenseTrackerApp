import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userId: null,
    username: 'User',
    theme: 'dark'
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userId = action.payload;
        },
        setProfileInfo: (state, action) => {
            state.username = action.payload.username || 'User';
            state.theme = action.payload.theme || 'dark';
        }
    },
});

export const { setUser, setProfileInfo } = appSlice.actions;
export default appSlice.reducer;
