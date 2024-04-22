import { Dropdown } from 'react-native-element-dropdown';
import React, { useLayoutEffect } from 'react'
import { Alert, Button, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Icon } from 'react-native-ui-lib'
import { Spinner } from '@gluestack-ui/themed';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { updateCategoriesForUsers, updateTransactionsForUsers } from '../services/userService';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
const addIconImage = require('../assets/add-icon.png');

function AddTransaction({ route }) {
    const [categories, onChangeCategories] = React.useState(route.params.categories);
    const [categoriesList, onChangeCategoriesList] = React.useState(route.params.categories.map((data) => ({ label: data.categoryName, value: data.categoryName })));
    const [transactions, onChangeTransactions] = React.useState(route.params.transactions ? route.params.transactions : []);
    const [selectedCategory, onChangeSelectedCategory] = React.useState("");
    const [comment, onChangeComment] = React.useState("");
    const [amountTransaction, onChangeAmountTransaction] = React.useState(0);
    const [showLoading, onChangeShowLoading] = React.useState(false);

    function AddNewTransaction() {
        if (!selectedCategory || !amountTransaction || !comment) {
            Alert.alert("PLease Enter Category, Amount and Comment");
            return;
        }
        onChangeShowLoading(true);
        let newTransaction = [...transactions];
        let transactionObj = { "category": selectedCategory, "date": new Date().toISOString(), "transactionAmount": amountTransaction, "type": amountTransaction > 0 ? "deposit" : "widthdraw", "comment": comment };
        newTransaction.unshift(transactionObj);
        updateTransactionsForUsers(route.params.userId, newTransaction, () => {
            onChangeTransactions(newTransaction);
            route.params.onChangeTransactions(newTransaction);
            let updatedCategories = [...categories].map(category => {
                if (transactionObj.category === category.categoryName) {
                    category.amountHold = parseFloat(category.amountHold) + parseFloat(transactionObj.transactionAmount);
                }
                return category;
            });
            updateCategoriesForUsers(route.params.userId, updatedCategories, () => {
                route.params.onChangeCategories(updatedCategories);
                onChangeAmountTransaction(0);
                onChangeShowLoading(false);
            })
        });
    }
    return (
        <SafeAreaView className="bg-[#512B81] h-full">
            <StatusBar
                animated={true}
                backgroundColor="#D4ADFC"
            />
            <View className="my-2 px-2 " style={{}}>
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={categoriesList}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Category"
                    searchPlaceholder="Search..."
                    value={selectedCategory}
                    onChange={item => {
                        onChangeSelectedCategory(item.value);
                    }}

                />


            </View>
            <View className="my-2 px-4 flex-row" >
                <TextInput className="" style={{ height: 40, width: "100%", marginRight: 10, color: "skyblue", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                    onChangeText={onChangeComment}
                    value={comment}
                    placeholder="Enter Comment"
                />
            </View>
            <View className="my-2 px-4 flex-row" >
                <TextInput className="" style={{ height: 40, width: "85%", marginRight: 10, color: "skyblue", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                    onChangeText={onChangeAmountTransaction}
                    value={amountTransaction}
                    placeholder="Enter Amount"
                    keyboardType='numeric'
                />
                <Pressable onPress={AddNewTransaction}>
                    <View className="bg-[#F27BBD] p-2 rounded-2xl">
                        <MaterialIcons name="currency-exchange" size={32} color="black" />
                    </View>
                </Pressable>

            </View>
            < Text text30 className="text-[#4fd3ff] font-extrabold p-4" >Transactions</ Text>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && transactions.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10, color: "orange" }}>No Transactions to Display. Please add A Transaction</Text>}
                {transactions.map((transaction) => (
                    <View key={transaction.date} className="bg-[#10439F] rounded-lg p-4 my-2 ">
                        <Text className="bg-[#874CCC] rounded-lg p-2 text-center font-bold text-white">{transaction.category}</Text>
                        <Text className="bg-[#C65BCF] rounded-lg p-2 m-2 text-center font-bold text-white">Amount: {transaction.transactionAmount}</Text>
                        <Text className="bg-[#F27BBD] rounded-lg p-2 mx-4  text-center font-bold text-white">{transaction.comment}</Text>
                        <Text className="bg-[#F27BBD] rounded-lg p-2 mx-8 my-2 text-center font-bold text-white">Date: {new Date(transaction.date).toLocaleString()}</Text>
                    </View>
                ))}

            </ScrollView>


        </SafeAreaView>
    )
}

export default AddTransaction;

const styles = StyleSheet.create({
    dropdown: {
        margin: 16,
        height: 30,
        width: "90%",
        borderBottomColor: 'white',
        borderBottomWidth: 0.5,
    },
    icon: {
        marginRight: 5,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});