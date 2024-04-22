import React, { useEffect, useLayoutEffect } from 'react'
import { View, Text, } from 'react-native-ui-lib';
import { ScrollView, Button, Image, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Category from './components/Category';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Spinner } from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
const addCategoryImage = require('../assets/add_new_category_item-512.webp');
const addTransactionImage = require('../assets/add-transaction.png');

function HomePage({ navigation }) {
    const [categories, onChangeCategories] = React.useState([]);
    const [transactions, onChangeTransactions] = React.useState([]);
    const [showLoading, onChangeShowLoading] = React.useState(true);
    const [showAddCategoriesModal, onChangeShowAddCategoriesModal] = React.useState(true);

    async function getUserCategories(user) {
        onChangeShowLoading(true);
        userId = user.uid;
        const docRef = doc(db, "user-categories", userId);
        const docSnap = await getDoc(docRef);
        let userInfo = []
        try {
            if (docSnap.exists()) {
                userInfo = docSnap.data();
                ("GET USER Categories -> ", userInfo);
                onChangeCategories(userInfo.categories);
                onChangeShowLoading(false);
            } else {
                console.error("FAILED TO GET USER INFO ->  ");
            }
            return userInfo;
        } catch (e) {
            console.error("FAILED TO GET USER CATEGORIES ->  ", e);
        }
    }
    async function getUserTransactions(user) {
        onChangeShowLoading(true);
        userId = user.uid;
        const docRef = doc(db, "user-transactions", userId);
        const docSnap = await getDoc(docRef);
        let userInfo = []
        try {
            if (docSnap.exists()) {
                userInfo = docSnap.data();
                onChangeTransactions(userInfo.transactions);
                onChangeShowLoading(false);
            } else {
                console.error("FAILED TO GET USER INFO ->  ");
            }
            return userInfo;
        } catch (e) {
            console.error("FAILED TO GET USER CATEGORIES ->  ", e);
        }
    }
    function onPressCategory(category) {
        let userTransactions = transactions ? transactions.filter(transaction => transaction.category == category.categoryName) : [];
        navigation.navigate('Transactions', { transactions: userTransactions, userId: auth.currentUser.uid });
    }

    useLayoutEffect(() => {
        if (auth) {
            getUserCategories(auth.currentUser);
            getUserTransactions(auth.currentUser);
        }


    }, [])
    return (
        <SafeAreaView className="bg-[#0C134F] h-full">
            <StatusBar
                animated={true}
                backgroundColor="#D4ADFC"
            />
            <View className="my-2 px-2">
                < Text text30 className="text-[#4fd3ff] font-extrabold" > Categories <MaterialIcons name="category" size={24} color="#4fd3ff" /></ Text>
            </View>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && categories.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10, color: "orange" }}>No Categories to Display. Please add A Category</Text>}
                {categories.map((category) => (
                    <Category key={category.categoryName} categoryName={category.categoryName} amountVisible={category.amountVisible} amount={category.amountHold + ""} onPressCategory={() => onPressCategory(category)} />
                ))}
            </ScrollView>
            <Pressable onPress={() => { navigation.navigate('Add Transactions', { categories, userId: auth.currentUser.uid, onChangeCategories, transactions, onChangeTransactions }); }}>
                <View onPress className="absolute right-4 bottom-6 bg-blue-300 p-2" style={{ borderRadius: 30 }}>
                    <Image style={{ width: 50, height: 50 }} source={addTransactionImage} />
                </View>
            </Pressable>
            <Pressable onPress={() => { navigation.navigate('Add Categories', { categories, userId: auth.currentUser.uid, onChangeCategories, transactions, onChangeTransactions }); }}>
                <View className="absolute right-4 bottom-28 bg-green-400 p-2" style={{ borderRadius: 30 }}>
                    <Image style={{ width: 50, height: 50 }} source={addCategoryImage} />
                </View>
            </Pressable>


        </SafeAreaView>
    )
}

export default HomePage