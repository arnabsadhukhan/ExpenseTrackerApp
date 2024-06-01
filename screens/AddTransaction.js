import { Dropdown } from 'react-native-element-dropdown';
import React from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Spinner } from '@gluestack-ui/themed';
import { updateTransactionsForUsers } from '../services/userService';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Transaction from './components/Transaction';
import { useDispatch, useSelector } from 'react-redux';
import { setTransactions } from './store/slice/dbSlice';

function AddTransaction({ route }) {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const categories = useSelector((state) => state.db.categories);
    const transactions = useSelector((state) => state.db.transactions);

    const [categoriesList, onChangeCategoriesList] = React.useState(categories.map((data) => ({ label: data.categoryName, value: data.categoryName })));
    const [selectedCategory, onChangeSelectedCategory] = React.useState(route.params.selectedCategory ? route.params.selectedCategory : "");
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
        updateTransactionsForUsers(userId, newTransaction, () => {
            dispatch(setTransactions(newTransaction));
            onChangeShowLoading(false);
        }, (err) => {
            Alert.alert(err);
        });

    }
    return (
        <SafeAreaView className="bg-[#fcfdff] h-full">
            <StatusBar barStyle="dark-content"
                animated={true}
                backgroundColor="#fcfdff"
            />
            <View className="flex-row items-center gap-2 m-2">
                <View className=" border-[#e6e8fd] border-2 rounded-full">
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        iconStyle={styles.iconStyle}
                        itemTextStyle={styles.itemTextStyle}
                        data={categoriesList}
                        maxHeight={200}
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
                <View className="flex-1 h-[38] p-2 pl-4 font-semibold border-[#ffddc2] border-2 rounded-full">
                    <TextInput
                        onChangeText={onChangeAmountTransaction}
                        value={amountTransaction + ""}
                        placeholder="Enter Amount"
                        keyboardType='numeric'
                    />
                </View>
            </View>
            <View className="flex-row px-4 gap-1 items-center" >
                <TextInput className="flex-1 pl-4 h-[40] font-semibold border-[#cbefef] border-2 rounded-full" style={{ width: 50 }}
                    onChangeText={onChangeComment}
                    value={comment}
                    placeholder="Enter Comment"
                />
                <TouchableOpacity onPress={AddNewTransaction}>
                    <View className=" ">
                        <MaterialIcons name="currency-exchange" size={32} color="black" />
                    </View>
                </TouchableOpacity>
            </View>
            <View className="px-2 mt-2">
                < Text className="font-bold text-md"> Transactions </ Text>
            </View>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && transactions.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10 }}>No Transactions to Display. Please add A Transaction</Text>}
                {transactions.map((transaction, index) => (
                    <Transaction key={index} index={index} transaction={transaction} />
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default AddTransaction;

const styles = StyleSheet.create({
    dropdown: {
        margin: 15,
        height: 5,
        width: 150,
        borderRadius: 20,
    },
    itemTextStyle: {
        fontWeight: 500,
        color: "grey"
    },
    icon: {
        // marginRight: 5,
        // borderRadius: 20

    },
    placeholderStyle: {
        fontSize: 16,
        fontWeight: 500,
        color: "grey"

    },
    selectedTextStyle: {
        fontSize: 16,
        fontWeight: 500,

    },
    iconStyle: {
        width: 20,
        height: 20,

    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        borderRadius: 20
    },
});