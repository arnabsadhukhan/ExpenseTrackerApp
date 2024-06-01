import React, { useLayoutEffect } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Alert, StatusBar, TouchableOpacity } from 'react-native'
import { auth, createNewuser, loginUser } from '../firebase';
import { getCategoriesForUsers, getExpenseListForUsers, getTransactionsForUsers, setDataForUsers } from '../services/userService';
import { Spinner } from '@gluestack-ui/themed';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/slice/appSlice';
import { setCategories, setExpenses, setTransactions } from './store/slice/dbSlice';

function LoginScreen({ navigation }) {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);

    const [showLoading, onChangeShowLoading] = React.useState(false);
    const [screenState, onChangeScreenState] = React.useState('login');
    const [email, onChangeEmail] = React.useState('');
    const [password, onChangePassword] = React.useState('');

    let navigateToHome = (userId, type = "login") => {
        if (userId) {
            dispatch(setUser(userId));
            setTimeout(function () {
                if (userId && type == "login") {
                    cacheData();
                    getCategoriesForUsers(userId, (userCategories) => {
                        dispatch(setCategories(userCategories.categories));
                        getTransactionsForUsers(userId, (userTransactions) => {
                            dispatch(setTransactions(userTransactions.transactions));

                            getExpenseListForUsers(userId, (expenseData) => {
                                dispatch(setExpenses(expenseData));
                                onChangeShowLoading(false);
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: "Home" }]
                                })
                            })
                        }, (err) => {
                            Alert.alert(err);
                        })
                    }, (err) => {
                        Alert.alert(err);
                    })
                }
                if (userId && type == "register") {
                    setDataForUsers(userId, () => {
                        dispatch(setCategories([]));
                        dispatch(setTransactions([]))
                        onChangeShowLoading(false);
                        cacheData();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Home" }]
                        })
                    }, (err) => {
                        Alert.alert(err);
                    });
                }
            }, 1000);
        }

    }
    let LoginHandler = () => {
        onChangeShowLoading(true);
        if (!email || !password) {
            Alert.alert('Please Provide Email and Password');
            return;
        }
        loginUser(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                onChangeShowLoading(false);
                navigateToHome(user.uid, "login");
            })
            .catch((error) => {
                if (error.message == "Firebase: Error (auth/invalid-credential).") {
                    Alert.alert("Invalid User Details. Please Enter Correct Email/Password");
                } else {
                    Alert.alert(error.message);
                }
                onChangeShowLoading(false);
            });

    }
    let registerHandler = () => {
        onChangeShowLoading(true);
        if (!email || !password) {
            Alert.alert('Please Provide Email and Password');
            return;
        }
        createNewuser(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                navigateToHome(user.uid, "register");
            })
            .catch((error) => {
                if (error.message == "Firebase: Error (auth/email-already-in-use).") {
                    Alert.alert("This Email Account is Already in Use. Please try Login");
                } else {
                    Alert.alert(error.message);
                }
                onChangeShowLoading(false);
            });

    }
    const cacheData = async () => {
        if (email === "" || password === "") {
            Alert.alert("Either key or value field is empty. Please enter values for both.");
            return;
        }
        try {
            await AsyncStorage.setItem(
                "email",
                email,
            );
            await AsyncStorage.setItem(
                "password",
                password,
            );
            // Alert.alert("Item with key: " + key + " and value: " + value + " successfully cached.")
        } catch (error) {
            Alert.alert("Some error occured while caching data. Check console logs for details.");
        }
    };
    const fetchData = async () => {
        try {
            const emailValue = await AsyncStorage.getItem("email");
            if (emailValue !== null) {
                onChangeEmail(emailValue);
            }
            const passwordValue = await AsyncStorage.getItem("password");
            if (passwordValue !== null) {
                onChangePassword(passwordValue);

            }
        } catch (error) {
            Alert.alert("Some error occured while fetching data. Check console logs for details.");
        }
    };
    useLayoutEffect(() => {
        fetchData();


    }, [])
    return (
        <KeyboardAvoidingView className="bg-[#fcfdff] align-middle pt-[25%] h-full">
            <StatusBar barStyle="dark-content"
                animated={true}
                backgroundColor="#fcfdff"
            />
            {screenState == "login" && (
                <View className=" m-2 h-2/3 p-4" style={{ borderRadius: 30 }}>
                    <View className="mt-10 flex-row items-center" >
                        <AntDesign name="user" size={32} color="#36c688" />
                        <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "#100d38", borderWidth: 2, borderColor: "#36c688", borderRadius: 20, paddingStart: 20 }}
                            onChangeText={onChangeEmail}
                            value={email}
                            placeholder="Enter Email"
                        />
                    </View>
                    <View className="flex-row items-center">
                        <MaterialIcons name="password" size={32} color="#36c688" />
                        <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "#100d38", borderWidth: 2, borderColor: "#36c688", borderRadius: 20, paddingStart: 20 }}
                            onChangeText={onChangePassword}
                            value={password}
                            placeholder="Enter Password"
                            secureTextEntry={true}
                        />
                    </View>
                    <View className="mt-5">
                        <TouchableOpacity className="bg-[#36c688] h-[50] flex justify-center rounded-lg" onPress={LoginHandler}>
                            <Text className="text-center text-white font-bold text-md ">Login</Text>
                        </TouchableOpacity>
                        <View style={{ marginVertical: 30, borderBottomColor: '#36c688', borderBottomWidth: StyleSheet.hairlineWidth, }}></View>
                        <TouchableOpacity className="border-[#36c688] border-spacing-2 h-[50] flex justify-center rounded-lg border-2" onPress={() => onChangeScreenState("register")}>
                            <Text className="text-center text-[#36c688] font-bold text-md ">Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
            }
            {
                screenState == "register" && (
                    <View className="m-2 h-2/3 p-4" style={{ borderRadius: 30 }}>
                        {/* <Text className="text-white font-extrabold text-2xl">Register</Text> */}
                        <View className="mt-10 flex-row items-center" >
                            <AntDesign name="user" size={32} color="#36c688" />
                            <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "#100d38", borderWidth: 2, borderColor: "#36c688", borderRadius: 20, paddingStart: 20 }}
                                onChangeText={onChangeEmail}
                                value={email}
                                placeholder="Enter Email"
                            />
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons name="password" size={32} color="#36c688" />
                            <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "#100d38", borderWidth: 2, borderColor: "#36c688", borderRadius: 20, paddingStart: 20 }}
                                onChangeText={onChangePassword}
                                value={password}
                                placeholder="Enter Password"
                                secureTextEntry={true}
                            />
                        </View>
                        <View className="mt-5">
                            <TouchableOpacity className="bg-[#36c688] h-[50] flex justify-center rounded-lg" onPress={registerHandler}>
                                <Text className="text-center text-white font-bold text-md ">Register</Text>
                            </TouchableOpacity>
                            <View style={{ marginVertical: 30, borderBottomColor: '#36c688', borderBottomWidth: StyleSheet.hairlineWidth, }}></View>
                            <TouchableOpacity className="border-[#36c688] border-spacing-2 h-[50] flex justify-center rounded-lg border-2" onPress={() => onChangeScreenState("login")}>
                                <Text className="text-center text-[#36c688] font-bold text-md ">Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
            {showLoading && <Spinner size="large" />}
        </KeyboardAvoidingView >
    )
}

export default LoginScreen