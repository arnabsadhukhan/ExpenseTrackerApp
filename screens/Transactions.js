import { Spinner } from '@gluestack-ui/themed';
import React from 'react'
import { SafeAreaView, ScrollView, StatusBar, Text, View, TouchableOpacity } from 'react-native';
import Transaction from './components/Transaction';
import { useDispatch, useSelector } from 'react-redux';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

function Transactions({ route }) {
    const transactions = useSelector((state) => state.db.transactions);
    const [showLoading, onChangeShowLoading] = React.useState(false);

    const userId = useSelector((state) => state.app.userId);
    const navigation = useNavigation();

    return (
        <SafeAreaView className="bg-[#fcfdff] h-full">
            <StatusBar barStyle="dark-content"
                animated={true}
                backgroundColor="#fcfdff"
            />
            <View className="px-2 flex-row justify-between m-2">
                < Text className="font-bold text-lg"> Transactions </ Text>
                <TouchableOpacity className="pt-1" onPress={() => {
                    navigation.navigate('Add Transactions', { selectedCategory: route.params.selectedCategory, userId: userId });
                }}>
                    <Entypo name="add-to-list" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && transactions.filter((transaction, index) => transaction.category == route.params.selectedCategory).length == 0 && <Text style={{ height: 40, width: "100%", margin: 10, color: "orange" }}>No Transactions to Display. Please add A Transaction</Text>}
                {transactions.map((transaction, index) => {
                    if (transaction.category == route.params.selectedCategory) {
                        return (
                            <Transaction key={transaction.date} index={index} transaction={transaction} />
                        )
                    }
                })
                }
            </ScrollView>
        </SafeAreaView>
    )
}

export default Transactions