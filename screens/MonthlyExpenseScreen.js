import { AntDesign, Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { useDispatch, useSelector } from 'react-redux';
import { updateExpensesForUsers } from '../services/userService';
import { Spinner } from '@gluestack-ui/themed';
import { setExpenses } from './store/slice/dbSlice';

const DATA = [{ id: 0, label: "Family", amount: 10000, complete: true },
{ id: 1, label: "Maa", amount: 1000, complete: false },
{ id: 2, label: "Bapi", amount: 3000, complete: false }
];

export default function MonthlyExpenseScreen() {
    let cardColors = ['#ffddc2', '#cbefef', '#e6e8fd', '#ffebd9', '#dff7f7', '#eef0fe', '#ffd7c5', '#d1eeee', '#e4e5fa', '#f8f8f8', '#e0e0e0', '#b0b0b0', '#ffead3', '#d8f5f5', '#ebedff'
    ]
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const incomeAmount = useSelector((state) => state.db.incomeAmount);
    const expenses = useSelector((state) => state.db.expenses);

    const [data, setData] = useState(expenses);
    const [editCategoryModalShow, setEditCategoryModalShow] = useState(false);
    const [editCategoryText, setEditCategoryText] = useState("")
    const [editCategoryAmount, setEditCategoryAmount] = useState(0)
    const [editItemCategoryAmount, setEditItemCategoryAmount] = useState(0)
    const [selectedEditItem, setSelectedEditItem] = useState(null)
    const [editIncomeAmountModalShow, setEditIncomeAmountModalShow] = useState(false)
    const [editItemCategoryAmountModalShow, setEditItemCategoryAmountModalShow] = useState(false)
    const [editIncomeAmount, setEditIncomeAmount] = useState(incomeAmount);
    const [showLoading, onChangeShowLoading] = React.useState(false);

    function onCategorySelect(item) {
        setEditItemCategoryAmount(item.amount)
        setSelectedEditItem(item);
        setEditItemCategoryAmountModalShow(true);
    }
    function editItemAmount() {
        if (!editItemCategoryAmount) {
            Alert.alert("Please Enter A Edit Amount");
            return;
        }
        let copy = JSON.parse(JSON.stringify(data));
        copy[selectedEditItem.id].amount = editItemCategoryAmount;
        setEditItemCategoryAmountModalShow(false);
        saveExpenseData(editIncomeAmount, copy);
    }
    function onAddCategory(item) {
        if (!editCategoryText || !editCategoryAmount) {
            Alert.alert("Please Enter category Name and Amount");
            return;
        }
        let _data = JSON.parse(JSON.stringify(expenses));
        _data.push({
            id: _data.length,
            label: editCategoryText,
            amount: parseFloat(editCategoryAmount),
            complete: false
        });
        setData(_data);
        setEditCategoryAmount(null);
        setEditCategoryText("")
        setEditCategoryModalShow(false);
        saveExpenseData(editIncomeAmount, _data);
    }


    function keyExtractor(item) {
        return item.id;
    }
    function onDeleteCategory(item) {
        Alert.alert("Delete", "Are You Sure You want to delete", [{
            text: "Cancel"
        }, {
            text: "Ok", onPress: () => {
                let copy = JSON.parse(JSON.stringify(data));
                copy.splice(item.id, 1);
                setData(copy);
                saveExpenseData(editIncomeAmount, copy);
            }
        }])

    }
    function updateExpense(item) {
        let copy = JSON.parse(JSON.stringify(data));
        copy[item.id].complete = !item.complete;
        setData(copy)
        saveExpenseData(editIncomeAmount, copy);
    }

    function renderItem(info) {
        const { item, onDragStart, onDragEnd, isActive } = info;
        let cardColor = cardColors[item.id % cardColors.length];

        return (
            <TouchableOpacity className="bg-blue-500 p-2 rounded-lg mb-1 mx-1" style={{ backgroundColor: cardColor }}
                key={item.id}
                onPress={() => onCategorySelect(item)}
                onPressIn={onDragStart}
                onPressOut={onDragEnd}>
                <View className="flex-row justify-between">
                    <View className="flex-row ">
                        <TouchableOpacity onPress={() => onDeleteCategory(item)}>
                            <MaterialIcons name="delete-outline" size={24} color="black" />
                        </TouchableOpacity>

                        <Text className="font-semibold ml-2">{item.label}</Text>
                    </View>
                    <View className="flex-row ">
                        <Text className="font-semibold mr-4">{item.amount}₹</Text>
                        <TouchableOpacity onPress={() => updateExpense(item)}>

                            {item.complete ? (<Ionicons name="checkmark-done-circle-sharp" size={24} color="black" />) : (<Ionicons name="checkmark-done-circle-outline" size={24} color="black" />)}
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    async function onReordered(fromIndex, toIndex) {
        let copy = JSON.parse(JSON.stringify(expenses)); // Don't modify react data in-place
        const removed = copy.splice(fromIndex, 1);

        copy.splice(toIndex, 0, removed[0]); // Now insert at the new pos
        copy = copy.map((category, index) => { category.id = index; return category });
        setData(copy);
        saveExpenseData(editIncomeAmount, copy);
    }
    function saveExpenseData(amount, data) {
        onChangeShowLoading(true);
        let payload = {
            incomeAmount: amount,
            expenses: data
        }
        updateExpensesForUsers(userId, payload, (expensesData) => {
            dispatch(setExpenses(expensesData))
            setEditIncomeAmount(amount);
            setData(expensesData.expenses);
            onChangeShowLoading(false);
            setEditIncomeAmountModalShow(false);
        }, (err) => {
            Alert.alert(err);
        })
    }

    return (
        <SafeAreaView className="mt-1 h-full">
            <TouchableOpacity onPress={() => setEditIncomeAmountModalShow(true)} >

                <View className="flex-row w-full justify-between m-2 p-2" style={{ backgroundColor: "#cbefef" }}>
                    <View className="flex-row ">
                        <TouchableOpacity>
                            {/* <Feather name="edit" size={20} color="black" /> */}
                        </TouchableOpacity>
                        <Text className="font-semibold ml-2">Income</Text>
                    </View>
                    {showLoading && <Spinner size="small" />}
                    <View className="flex-row ">
                        <Text className="font-semibold mr-4">{editIncomeAmount}₹</Text>
                        {/* <TouchableOpacity onPress={() => updateExpense(item)}>

                        {item.complete ? (<Ionicons name="checkmark-done-circle-outline" size={24} color="black" />) : (<Ionicons name="checkmark-done-circle-sharp" size={24} color="black" />)}
                    </TouchableOpacity> */}
                    </View>
                </View>
            </TouchableOpacity>

            <View className="h-[84%]">

                <DragList
                    data={data}
                    keyExtractor={keyExtractor}
                    onReordered={onReordered}
                    renderItem={renderItem}
                />
            </View>
            <View className="flex-row w-full justify-between mx-2 p-2 absolute bottom-4" style={{ backgroundColor: "#cbefef" }}>
                <View className="flex-row ">
                    <TouchableOpacity>
                        {/* <Feather name="edit" size={20} color="black" /> */}
                    </TouchableOpacity>
                    <Text className="font-semibold ml-2">{"Total"}</Text>
                </View>
                <View className="flex-row ">
                    <Text className="font-semibold mr-4">{data.reduce((accumulator, currentValue) => {
                        return accumulator + (currentValue.complete ? Number(currentValue.amount) : 0);
                    }, 0)}₹</Text>
                    {/* <TouchableOpacity onPress={() => updateExpense(item)}>

                        {item.complete ? (<Ionicons name="checkmark-done-circle-outline" size={24} color="black" />) : (<Ionicons name="checkmark-done-circle-sharp" size={24} color="black" />)}
                    </TouchableOpacity> */}
                </View>
            </View>

            <Modal
                className="m-5"
                animationType="slide"
                transparent={true}
                visible={editCategoryModalShow}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>

                <View className="bg-[#D4ADFC] m-10 mt-[50%]  rounded-xl p-5">
                    < Text className="text-white font-extrabold p-2" >Add Category</ Text>
                    <TextInput className="" style={{ height: 40, width: "100%", marginRight: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                        onChangeText={setEditCategoryText}
                        value={editCategoryText}
                        placeholder="Edit Category"
                    />
                    <TextInput className="mt-1" style={{ height: 40, width: "100%", marginRight: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                        onChangeText={setEditCategoryAmount}
                        value={editCategoryAmount}
                        keyboardType='numeric'
                        placeholder="Edit Amount"
                    />
                    <View className="p-4 flex-row justify-end">
                        <TouchableOpacity className="p-2" onPress={() => { onAddCategory() }}>
                            <AntDesign name="save" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2" onPress={() => setEditCategoryModalShow(false)}>
                            <MaterialIcons name="cancel" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                className="m-5"
                animationType="slide"
                transparent={true}
                visible={editIncomeAmountModalShow}
            >

                <View className="bg-[#D4ADFC] m-10 mt-[50%]  rounded-xl p-5">
                    <Text className="text-white font-extrabold p-2" >Edit Income Amount</ Text>
                    <TextInput className="mt-1" style={{ height: 40, width: "100%", marginRight: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                        onChangeText={setEditIncomeAmount}
                        value={editIncomeAmount}
                        keyboardType='numeric'
                        placeholder="Edit Amount"
                    />
                    <View className="p-4 flex-row justify-end">
                        <TouchableOpacity className="p-2" onPress={() => { saveExpenseData(editIncomeAmount, data) }}>
                            <AntDesign name="save" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2" onPress={() => setEditIncomeAmountModalShow(false)}>
                            <MaterialIcons name="cancel" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                className="m-5"
                animationType="slide"
                transparent={true}
                visible={editItemCategoryAmountModalShow}
            >

                <View className="bg-[#D4ADFC] m-10 mt-[50%]  rounded-xl p-5">
                    <Text className="text-white font-extrabold p-2" >Edit Expense Amount</ Text>
                    <TextInput className="mt-1" style={{ height: 40, width: "100%", marginRight: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                        onChangeText={setEditItemCategoryAmount}
                        value={editItemCategoryAmount}
                        keyboardType='numeric'
                        placeholder="Edit Amount"
                    />
                    <View className="p-4 flex-row justify-end">
                        <TouchableOpacity className="p-2" onPress={() => { editItemAmount() }}>
                            <AntDesign name="save" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2" onPress={() => setEditItemCategoryAmountModalShow(false)}>
                            <MaterialIcons name="cancel" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity className="absolute bottom-20 left-5 bg-orange-200 rounded-lg p-2" onPress={() => setEditCategoryModalShow(true)}>

                <FontAwesome6 name="add" size={24} color="black" />
            </TouchableOpacity>

        </SafeAreaView >
    );
}