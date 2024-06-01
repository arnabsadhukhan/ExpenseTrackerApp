import { Fontisto, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { updateTransactionsForUsers } from '../../services/userService';
import { useDispatch, useSelector } from 'react-redux';
import { setTransactions } from '../store/slice/dbSlice';
import { Spinner } from '@gluestack-ui/themed';

function Transaction({ transaction, index }) {
    let transactionColors = [
        '#ffddc2',
        '#cbefef',
        '#e6e8fd',
        '#ffebd9',
        '#dff7f7',
        '#eef0fe',
        '#ffd7c5',
        '#d1eeee',
        '#e4e5fa',
        '#f8f8f8',
        '#e0e0e0',
        '#b0b0b0',
        '#ffead3',
        '#d8f5f5',
        '#ebedff'
    ];
    let transactionColor = transactionColors[index % transactionColors.length];

    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const transactions = useSelector((state) => state.db.transactions);
    const [showLoading, onChangeShowLoading] = React.useState(false);

    let deleteTransactions = (transaction) => {
        Alert.alert("Delete", "Are You Sure You want to delete this Transaction", [{
            text: "Cancel"
        }, {
            text: "Ok", onPress: () => {
                let newTransactions = [...transactions];
                const index = newTransactions.findIndex(obj => obj.date === transaction.date); // Change 'someKey' to your key

                if (index !== -1) {
                    onChangeShowLoading(true);
                    // Remove the object from the array
                    newTransactions.splice(index, 1);
                    updateTransactionsForUsers(userId, newTransactions, () => {
                        dispatch(setTransactions(newTransactions));
                        onChangeShowLoading(false);
                    }, (err) => {
                        Alert.alert(err);
                    })
                }
            }
        }])

    }
    return (
        <View key={transaction.date} className="rounded-lg p-4 my-2" style={{ backgroundColor: transactionColor }}>

            <View className="flex-row justify-between">

                <View className="flex-row items-center">
                    <Fontisto name="date" size={14} color="black" />
                    <Text className="font-semibold p-1">{new Date(transaction.date).toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteTransactions(transaction)}>
                    <MaterialCommunityIcons name="delete-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-between">

                <View className="flex-row items-center gap-2">
                    <MaterialIcons name="currency-exchange" size={24} color="black" />
                    <View>
                        <Text className="font-semibold">{transaction.category}</Text>
                        <Text className="max-w-[250] text-sm">{transaction.comment} </Text>
                    </View>
                </View>
                {showLoading && <Spinner size="large" />}
                <View>
                    <Text className="font-semibold">{transaction.transactionAmount}₹</Text>
                </View>
            </View>

        </View >
    )
}

export default Transaction