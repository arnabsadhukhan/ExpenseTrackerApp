import { Spinner } from '@gluestack-ui/themed';
import React from 'react'
import { SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';

function Transactions({ route }) {
    const [transactions, onChangeTransactions] = React.useState(route.params.transactions);
    const [showLoading, onChangeShowLoading] = React.useState(false);
    return (
        <SafeAreaView className="bg-[#512B81] h-full">
            <StatusBar
                animated={true}
                backgroundColor="#D4ADFC"
            />
            < Text text30 className="text-[#4fd3ff] font-extrabold p-4" >Transactions</ Text>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && transactions.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10, color: "orange" }}>No Transactions to Display. Please add A Transaction</Text>}
                {transactions.map((transaction) => (
                    <View key={transaction.date} className="bg-[#10439F] rounded-lg p-4 my-2 ">
                        <Text className="bg-[#874CCC] rounded-lg p-2 text-center font-bold text-white">{transaction.category}</Text>
                        <Text className="bg-[#C65BCF] rounded-lg p-2 m-2 text-center font-bold text-white">Amount: {transaction.transactionAmount}</Text>
                        <Text className="bg-[#F27BBD] rounded-lg p-2 mx-4  text-center font-bold text-white">{transaction.comment} </Text>
                        <Text className="bg-[#F27BBD] rounded-lg p-2 mx-8 my-2 text-center font-bold text-white">Date: {new Date(transaction.date).toLocaleString()}</Text>
                    </View>
                ))}

            </ScrollView>
        </SafeAreaView>
    )
}

export default Transactions