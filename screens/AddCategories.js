import React from 'react'
import { Alert, Button, FlatList, Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Category from './components/Category';
import { updateCategoriesForUsers, updateTransactionsForUsers } from '../services/userService';
import { Spinner } from '@gluestack-ui/themed';
import { AntDesign, Entypo, Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
const addIconImage = require('../assets/add-icon.png');

function AddCategories({ route }) {
    const [categories, onChangeCategories] = React.useState(route.params.categories);
    const [transactions, onChangeTransactions] = React.useState(route.params.transactions ? route.params.transactions : []);
    const [amountHold, onChangeAmountHold] = React.useState(0);
    const [addCategoryText, onChangeAddCategoryText] = React.useState("");
    const [editCategoryText, onChangeEditCategoryText] = React.useState("");
    const [editCategoryIndex, onChangeEditCategoryIndex] = React.useState(0);
    const [showLoading, onChangeShowLoading] = React.useState(false);
    const [changeDetected, onChangeChangeDetected] = React.useState(false);
    const [changeDetectedTransactions, onChangeChangeDetectedTransactions] = React.useState(false);
    const [editCategoryModalShow, onChangeEditCategoryModalShow] = React.useState(false);


    function addNewCategoryHandler() {
        if (!addCategoryText || amountHold === "") {
            Alert.alert("Please Enter A Category Name and Initial Amount Hold.");
            return;
        }
        if (categories.find((data) => data.categoryName == addCategoryText)) {
            Alert.alert("Please Enter A Unique Category Name");
            return;
        }
        onChangeShowLoading(true);
        let newCategories = [...categories];
        newCategories.push({ id: newCategories.length + "", categoryName: addCategoryText, amountHold: amountHold, amountVisible: true })
        updateCategoriesForUsers(route.params.userId, newCategories, () => {
            route.params.onChangeCategories(newCategories);
            onChangeCategories(newCategories);
            onChangeShowLoading(false);
            onChangeAddCategoryText("");
            onChangeAmountHold(0);
        });
    }
    function onCategoryMove(type, category) {
        let _categories = [...categories];
        if (type == "up" && category.id > 0) {
            currentPosition = parseInt(category.id);
            newPosition = currentPosition - 1;
            tempCurrentValue = _categories[currentPosition];
            // tempCurrentValue.id = newPosition + "";
            tempNewPositionValue = _categories[newPosition];
            // tempNewPositionValue.id = currentPosition + "";

            _categories[currentPosition] = tempNewPositionValue;
            _categories[newPosition] = tempCurrentValue;
            _categories.map((_category, index) => {
                _category.id = index + "";
                return _category;
            });
            onChangeCategories(_categories);
            onChangeChangeDetected(true);
        }
        else if (type == "down" && category.id < categories.length - 1) {
            currentPosition = parseInt(category.id);
            newPosition = currentPosition + 1;
            tempCurrentValue = _categories[currentPosition];
            // tempCurrentValue.id = newPosition + "";
            tempNewPositionValue = _categories[newPosition];
            // tempNewPositionValue.id = currentPosition + "";

            _categories[currentPosition] = tempNewPositionValue;
            _categories[newPosition] = tempCurrentValue;
            _categories.map((_category, index) => {
                _category.id = index + "";
                return _category;
            });
            onChangeCategories(_categories);
            onChangeChangeDetected(true);
        }
    }
    function onEditOrDeleteCategory(type, category = {}) {
        if (type == "edit") {
            onChangeEditCategoryIndex(parseInt(category.id));
            onChangeEditCategoryText(category.categoryName);
            onChangeEditCategoryModalShow(true);
        }
        if (type == "save") {
            let _transactions = [...transactions];
            let oldCategoryName = categories[parseInt(editCategoryIndex)].categoryName;
            categories[parseInt(editCategoryIndex)].categoryName = editCategoryText;
            onChangeCategories(categories);

            _transactions.map(transaction => {
                if (transaction.category == oldCategoryName) {
                    transaction.category = editCategoryText;
                }
                return transaction;
            });
            onChangeTransactions(_transactions);
            onChangeChangeDetectedTransactions(true);
            // route.params.onChangeTransactions(_transactions);

            onChangeEditCategoryIndex("");
            onChangeEditCategoryText("");
            onChangeEditCategoryModalShow(false);
            onChangeChangeDetected(true);
        }
        if (type == "cancel") {
            onChangeEditCategoryIndex("");
            onChangeEditCategoryText("");
            onChangeEditCategoryModalShow(false);
        }
        if (type == "hide/unhide") {
            let _categories = [...categories];
            _categories.map((data) => {
                if (data.categoryName == category.categoryName)
                    data.amountVisible = !category.amountVisible;
                return data;
            });
            onChangeCategories(_categories);
            onChangeChangeDetected(true);
        }
        if (type == "delete") {
            let _categories = [...categories];
            _categories = _categories.filter((data) => data.id != category.id);
            _categories.map((_category, index) => {
                _category.id = index + "";
                return _category;
            });
            Alert.alert("Delete", "Are You Sure You want to delete", [{
                text: "Cancel"
            }, {
                text: "Ok", onPress: () => {
                    onChangeCategories(_categories);
                    onChangeChangeDetected(true);
                }
            }])

        }

    }
    function saveEditedCategories() {
        onChangeShowLoading(true);
        let newCategories = [...categories];
        updateCategoriesForUsers(route.params.userId, newCategories, () => {
            route.params.onChangeCategories(newCategories);
            onChangeCategories(newCategories);
            onChangeShowLoading(false);
            onChangeAddCategoryText("");
            onChangeAmountHold(0);
            onChangeChangeDetected(false);
        });
        if (changeDetectedTransactions) {
            updateTransactionsForUsers(route.params.userId, transactions, () => {
                route.params.onChangeTransactions(transactions);
                onChangeChangeDetectedTransactions(false);
            });
        }
    }






    return (
        <SafeAreaView className="bg-[#610C9F] h-full">
            <StatusBar
                animated={true}
                backgroundColor="#D4ADFC"
            />
            <View className="my-2 px-2 flex-row" style={{}}>
                <TextInput className="" style={{ height: 40, width: "40%", marginRight: 10, color: "skyblue", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                    onChangeText={onChangeAddCategoryText}
                    value={addCategoryText}
                    placeholder="Enter Category"
                />
                <TextInput className="" style={{ height: 40, width: "40%", marginRight: 10, color: "skyblue", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                    onChangeText={onChangeAmountHold}
                    value={amountHold + ""}
                    placeholder="Enter Amount"
                    keyboardType='numeric'
                />
                <Pressable onPress={addNewCategoryHandler}>
                    <View className="bg-[#DA0C81] p-2 rounded-2xl">
                        <Entypo name="add-to-list" size={32} color="white" />
                    </View>
                </Pressable>
            </View>
            < Text text30 className="text-white font-extrabold p-4" >Categories</ Text>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && categories.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10, color: "orange" }}>No Categories to Display. Please add A Category</Text>}
                {categories.map((item) => (
                    <TouchableOpacity key={item.id} className="bg-[#DA0C81] m-2 rounded-xl" >
                        <View className=" " style={{ borderRadius: 20 }}>
                            < Text className="text-2xl text-white font-extrabold text-center pb-2" > {item.categoryName}
                            </ Text>
                        </View>
                        <View className=" flex-row justify-evenly ">
                            <TouchableOpacity className="p-2 " onPress={() => onCategoryMove("up", item)}>
                                <AntDesign name="arrowup" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onEditOrDeleteCategory("edit", item)}>
                                <Feather name="edit" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onCategoryMove("down", item)}>
                                <AntDesign name="arrowdown" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onEditOrDeleteCategory("delete", item)}>
                                <AntDesign name="delete" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onEditOrDeleteCategory("hide/unhide", item)}>
                                {item.amountVisible ? (<Feather name="eye" size={24} color="white" />) : (<Feather name="eye-off" size={24} color="white" />)}
                            </TouchableOpacity>

                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {changeDetected && (
                <TouchableOpacity onPress={saveEditedCategories}>
                    <View className="absolute right-4 bottom-12 bg-blue-400 p-3 rounded-xl">
                        <FontAwesome5 name="save" size={32} color="white" />
                    </View>
                </TouchableOpacity>
            )}

            <Modal
                className="m-5"
                animationType="slide"
                transparent={true}
                visible={editCategoryModalShow}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');

                }}>

                <View className="bg-[#D4ADFC] m-10 mt-[50%]  rounded-xl p-5">
                    < Text className="text-white font-extrabold p-2" >Edit Category Name</ Text>
                    <TextInput className="" style={{ height: 40, width: "100%", marginRight: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                        onChangeText={onChangeEditCategoryText}
                        value={editCategoryText}
                        placeholder="Edit Category"
                    />
                    <View className="p-4 flex-row justify-end">
                        <TouchableOpacity className="p-2" onPress={() => { onEditOrDeleteCategory("save") }}>
                            <AntDesign name="save" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2" onPress={() => onEditOrDeleteCategory("cancel")}>
                            <MaterialIcons name="cancel" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


        </SafeAreaView >
    )
}

export default AddCategories