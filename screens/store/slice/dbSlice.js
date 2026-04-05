import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    categories: [],
    transactions: [],
    tags: [],
    lends: [],
    lastVisibleTransaction: null,
    hasMoreTransactions: true
};

const dbSlice = createSlice({
    name: 'db',
    initialState,
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload || [];
        },
        setTransactions: (state, action) => {
            state.transactions = action.payload.transactions || [];
            state.lastVisibleTransaction = action.payload.lastVisible || null;
            state.hasMoreTransactions = action.payload.transactions.length >= 20; // assuming limit is 20
        },
        appendTransactions: (state, action) => {
            const newTransactions = action.payload.transactions || [];
            if (newTransactions.length > 0) {
                // Ensure no duplicates just in case
                const existingIds = new Set(state.transactions.map(t => t.id));
                const filteredNew = newTransactions.filter(t => !existingIds.has(t.id));
                state.transactions = [...state.transactions, ...filteredNew];
            }
            state.lastVisibleTransaction = action.payload.lastVisible || state.lastVisibleTransaction;
            state.hasMoreTransactions = newTransactions.length >= 20; // assuming limit is 20
        },
        prependTransaction: (state, action) => {
            state.transactions = [action.payload, ...state.transactions];
        },
        setTags: (state, action) => {
            state.tags = action.payload || [];
        },
        setLends: (state, action) => {
            state.lends = action.payload || [];
        },
        updateCategoryState: (state, action) => {
            const index = state.categories.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.categories[index] = { ...state.categories[index], ...action.payload.updates };
            }
        },
        clearDbState: (state) => {
             state.categories = [];
             state.transactions = [];
             state.tags = [];
             state.lends = [];
             state.lastVisibleTransaction = null;
             state.hasMoreTransactions = true;
        }
    },
});

export const { setCategories, setTransactions, appendTransactions, prependTransaction, setTags, setLends, clearDbState, updateCategoryState } = dbSlice.actions;
export default dbSlice.reducer;
