import React from 'react'
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateCategoriesForUsers, updateTransactionsForUsers } from '../services/userService';
import { Spinner } from '@gluestack-ui/themed';
import { AntDesign, Entypo, Feather, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { setCategories, setTransactions, updateTransactions } from './store/slice/dbSlice';

function AddCategories({ route }) {
    let cardColors = ['#ffddc2', '#cbefef', '#e6e8fd']
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);

    const categories = useSelector((state) => state.db.categories);
    const transactions = useSelector((state) => state.db.transactions);

    const [showLoading, onChangeShowLoading] = React.useState(false);
    const [addCategoryText, onChangeAddCategoryText] = React.useState("");
    const [editCategoryText, onChangeEditCategoryText] = React.useState("");
    const [editCategoryIndex, onChangeEditCategoryIndex] = React.useState(0);
    const [editCategoryModalShow, onChangeEditCategoryModalShow] = React.useState(false);

    function onChangeCategories(categories) {
        dispatch(setCategories(categories));
    }
    function onChangeTransactions(transactions) {
        dispatch(setTransactions(transactions));
    }

    function addNewCategoryHandler() {
        if (!addCategoryText || categories.find((data) => data.categoryName == addCategoryText)) {
            Alert.alert("Please Enter A Unique Category Name");
            return;
        }
        onChangeShowLoading(true);
        let newCategories = [...categories];
        newCategories.push({ id: newCategories.length + "", categoryName: addCategoryText, amountVisible: true })
        updateCategoriesForUsers(route.params.userId, newCategories, () => {
            dispatch(setCategories(newCategories));
            dispatch(updateTransactions())
            onChangeShowLoading(false);
        }, (err) => {
            Alert.alert(err);
        });
    }
    function onCategoryMove(type, category, currentPosition) {
        let _categories = [...categories];
        if (type == "up" && currentPosition > 0) {
            // currentPosition = parseInt(category.id);
            newPosition = currentPosition - 1;
            tempCurrentValue = _categories[currentPosition];
            tempCurrentValue.id = newPosition + "";
            tempNewPositionValue = _categories[newPosition];
            // tempNewPositionValue.id = currentPosition + "";

            _categories[currentPosition] = tempNewPositionValue;
            _categories[newPosition] = tempCurrentValue;
            _categories.map((_category, index) => {
                _category.id = index + "";
                return _category;
            });
            onChangeCategories(_categories);
        }
        else if (type == "down" && currentPosition < categories.length - 1) {
            // currentPosition = parseInt(category.id);
            newPosition = currentPosition + 1;
            tempCurrentValue = _categories[currentPosition];
            tempCurrentValue.id = newPosition + "";
            tempNewPositionValue = _categories[newPosition];
            // tempNewPositionValue.id = currentPosition + "";

            _categories[currentPosition] = tempNewPositionValue;
            _categories[newPosition] = tempCurrentValue;
            _categories.map((_category, index) => {
                _category.id = index + "";
                return _category;
            });
            onChangeCategories(_categories);
        }
    }
    function onEditOrDeleteCategory(type, category = {}) {
        if (type == "edit") {
            onChangeEditCategoryIndex(parseInt(category.id));
            onChangeEditCategoryText(category.categoryName);
            onChangeEditCategoryModalShow(true);
        }
        if (type == "save") {
            let _transactions = JSON.parse(JSON.stringify(transactions));
            let _categories = JSON.parse(JSON.stringify(categories));
            let oldCategoryName = _categories[parseInt(editCategoryIndex)].categoryName;

            _categories.map((category, index) => {
                if (category.categoryName == oldCategoryName) {
                    category.categoryName = editCategoryText;
                }
                return category;
            })
            Alert.alert("Edit", "Are You Sure You Edit This Name", [{
                text: "Cancel"
            }, {
                text: "Ok", onPress: () => {
                    _transactions.map(transaction => {
                        if (transaction.category == oldCategoryName) {
                            transaction.category = editCategoryText;
                        }
                        return transaction;
                    });
                    onChangeCategories(_categories);
                    onChangeTransactions(_transactions);
                    onChangeEditCategoryModalShow(false);
                }
            }])

        }
        if (type == "cancel") {
            onChangeEditCategoryIndex("");
            onChangeEditCategoryText("");
            onChangeEditCategoryModalShow(false);
        }
        if (type == "hide/unhide") {
            let _categories = JSON.parse(JSON.stringify(categories));
            _categories.map((data) => {
                if (data.categoryName == category.categoryName)
                    data.amountVisible = !category.amountVisible;
                return data;
            });
            onChangeCategories(_categories);
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
                }
            }])
        }
    }

    return (
        <SafeAreaView className="bg-[#fcfdff] h-full ">
            <StatusBar barStyle="dark-content"
                animated={true}
                backgroundColor="#fcfdff"
            />
            <View className="mx-2 flex-row items-center" style={{}}>
                <View className="p-1 mr-2 border-[#ffddc2] border-2 rounded-full flex-1">
                    <TextInput className="pl-4 font-semibold"
                        onChangeText={onChangeAddCategoryText}
                        value={addCategoryText}
                        placeholder="Enter Category"
                    />
                </View>
                <TouchableOpacity onPress={addNewCategoryHandler}>
                    <View className="bg-gray-200 rounded-xl p-1" style={{ padding: 3 }}>
                        <Entypo name="add-to-list" size={32} color="black" />
                    </View>
                </TouchableOpacity>

            </View>
            <View className="px-2">
                < Text className="font-bold text-md"> Categories </ Text>
            </View>
            <ScrollView className="px-2">
                {showLoading && <Spinner size="large" />}
                {!showLoading && categories.length == 0 && <Text style={{ height: 40, width: "100%", margin: 10 }}>No Categories to Display. Please add A Category</Text>}
                {categories.map((item, index) => (
                    <TouchableOpacity key={item.id} className=" m-2 rounded-xl" style={{ backgroundColor: cardColors[index % 3] }}>
                        <View className=" mt-2" style={{ borderRadius: 20 }}>
                            < Text className="text-xl font-semibold text-[#200b06] text-center pb-2" > {item.categoryName}
                            </ Text>
                        </View>
                        <View className=" flex-row justify-evenly ">
                            <TouchableOpacity className="p-2 " onPress={() => onCategoryMove("up", item, index)}>
                                <AntDesign name="arrowup" size={24} color="#200b06" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onEditOrDeleteCategory("edit", item)}>
                                <Feather name="edit" size={24} color="#200b06" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onCategoryMove("down", item, index)}>
                                <AntDesign name="arrowdown" size={24} color="#200b06" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onEditOrDeleteCategory("delete", item)}>
                                <AntDesign name="delete" size={24} color="#200b06" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 " onPress={() => onEditOrDeleteCategory("hide/unhide", item)}>
                                {item.amountVisible ? (<Feather name="eye" size={24} color="#200b06" />) : (<Feather name="eye-off" size={24} color="#200b06" />)}
                            </TouchableOpacity>

                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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