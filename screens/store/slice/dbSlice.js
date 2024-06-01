// exampleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    categories: [],
    transactions: []
};

let updateCategoriesAmountHold = (categories, categoryAmountHoldMapping) => {
    let newCategories = [...categories];
    return newCategories.map((category, index) => {
        category.amountHold = categoryAmountHoldMapping[category.categoryName] ? categoryAmountHoldMapping[category.categoryName] : 0;
        return category;
    });
}

const dbSlice = createSlice({
    name: 'db',
    initialState,
    reducers: {
        setCategories: (state, action) => {
            let newCategories = JSON.parse(JSON.stringify(action.payload));
            if (newCategories && newCategories.length > 0) {
                newCategories.map((category, index) => {
                    category.id = index;
                    return category;
                });
            }
            state.categories = newCategories;
        },
        setTransactions: (state, action) => {
            state.transactions = action.payload;
            let categoryAmountHoldMapping = {};
            action.payload.forEach((transaction) => {
                if (categoryAmountHoldMapping.hasOwnProperty(transaction.category)) {
                    categoryAmountHoldMapping[transaction.category] += parseFloat(transaction.transactionAmount);
                } else {
                    categoryAmountHoldMapping[transaction.category] = parseFloat(transaction.transactionAmount);
                }
            })
            let newCategories = updateCategoriesAmountHold(state.categories, categoryAmountHoldMapping);
            state.categories = newCategories;
        },
        updateTransactions: (state, action) => {
            let categoryAmountHoldMapping = {};
            state.transactions.forEach((transaction) => {
                if (categoryAmountHoldMapping.hasOwnProperty(transaction.category)) {
                    categoryAmountHoldMapping[transaction.category] += parseFloat(transaction.transactionAmount);
                } else {
                    categoryAmountHoldMapping[transaction.category] = parseFloat(transaction.transactionAmount);
                }
            })
            let newCategories = updateCategoriesAmountHold(state.categories, categoryAmountHoldMapping);
            state.categories = newCategories;
        }

    },
});

export const { setUser, setCategories, setTransactions, updateTransactions } = dbSlice.actions;
export default dbSlice.reducer;
