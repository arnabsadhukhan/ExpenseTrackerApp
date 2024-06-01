import React, { useLayoutEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, } from 'react-native-ui-lib';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Category from './components/Category';
import { Spinner } from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { setCategories, setTransactions } from './store/slice/dbSlice';
import { getCategoriesForUsers, getTransactionsForUsers } from '../services/userService';
import { auth } from '../firebase';

function HomePage({ navigation }) {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const categories = useSelector((state) => state.db.categories);
    const transactions = useSelector((state) => state.db.transactions);

    const [showLoading, onChangeShowLoading] = React.useState(true);
    const [callInProgress, onChangeCallInProgress] = React.useState(false);

    function onPressCategory(category) {
        navigation.navigate('Transactions', { selectedCategory: category.categoryName, userId: userId });
    }

    useLayoutEffect(() => {
        if (userId) {
            onChangeShowLoading(false);
        }
    }, [])
    return (
        <View className="h-full">
            <SafeAreaView className="bg-[#fcfdff] h-[90%]">
                <StatusBar barStyle="dark-content"
                    animated={true}
                    backgroundColor="#fcfdff"
                />
                <View className="px-2">
                    < Text className="font-bold text-lg"> Categories <MaterialIcons name="category" size={10} /></ Text>
                </View>
                <ScrollView className="px-2 ">
                    {showLoading && <Spinner size="large" />}
                    {!showLoading && categories.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10 }}>No Categories to Display. Please add A Category</Text>}
                    {categories.map((category, index) => (
                        <Category index={index} key={category.id} category={category.categoryName} amountVisible={category.amountVisible} amount={category.amountHold + ""} onPressCategory={() => onPressCategory(category)} />
                    ))}
                </ScrollView>
                <View>

                </View>


            </SafeAreaView>
            <View style={{ borderTopEndRadius: 50, borderTopStartRadius: 50 }} className=" h-[10%] flex-row items-center justify-evenly rounded-t-lg">
                <TouchableOpacity onPress={() => { navigation.navigate('Add Categories', { categories, userId: userId, transactions }); }}>
                    <MaterialIcons name="format-list-bulleted-add" size={24} color="black" />
                </TouchableOpacity >
                <TouchableOpacity onPress={() => {
                    navigation.navigate('Add Transactions', {
                        categories, userId: userId, transactions
                    });
                }}>
                    <MaterialIcons name="currency-exchange" size={24} color="black" />
                </TouchableOpacity >
            </View >
        </View >
    )
}

export default HomePage