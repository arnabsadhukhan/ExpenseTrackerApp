import React, { useLayoutEffect } from 'react'
import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Pressable, Image, Alert, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth, createNewuser, loginUser } from '../firebase';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setDataForUsers } from '../services/userService';
import { Spinner } from '@gluestack-ui/themed';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


const googleImage = require('../assets/google-logo.jpg');

function LoginScreen({ navigation }) {
    const [showLoading, onChangeShowLoading] = React.useState(false);
    const [screenState, onChangeScreenState] = React.useState('login');
    const [email, onChangeEmail] = React.useState('');
    const [password, onChangePassword] = React.useState('');
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
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }]
                });
                cacheData();
                // navigation.navigate('Home');
            })
            .catch((error) => {
                console.log(error.message)
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
                setDataForUsers(userCredential.user.uid);
                onChangeShowLoading(false);
                cacheData();
            })
            .catch((error) => {
                console.log(error.message)

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
        auth.onAuthStateChanged((user) => {
            if (user) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }]
                })
            }
        })
        fetchData();


    }, [])
    return (
        <KeyboardAvoidingView className="bg-[#10439F] h-full align-middle pt-[25%]">
            <StatusBar
                animated={true}
                backgroundColor="#D4ADFC"
            />
            {screenState == "login" && (
                <View className="bg-[#874CCC] m-2 h-2/3 p-4" style={{ borderRadius: 30 }}>
                    <Text className="text-white font-extrabold text-2xl">LOGIN</Text>
                    <View className="mt-10 flex-row items-center" >
                        <AntDesign name="user" size={32} color="white" />
                        <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                            onChangeText={onChangeEmail}
                            value={email}
                            placeholder="Enter Email"
                        />
                    </View>
                    <View className="flex-row items-center">
                        <MaterialIcons name="password" size={32} color="white" />
                        <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                            onChangeText={onChangePassword}
                            value={password}
                            placeholder="Enter Password"
                            // keyboardType='invisible-password'
                            secureTextEntry={true}
                        />
                    </View>
                    <View className="mt-5">
                        <Button className="mt-10"
                            title="Login"
                            color="#C65BCF"
                            onPress={LoginHandler}
                        />
                        <View style={{ marginVertical: 30, borderBottomColor: 'white', borderBottomWidth: StyleSheet.hairlineWidth, }}></View>
                        <Button className="mt-10"
                            title="Register"
                            color="#F27BBD"
                            onPress={() => onChangeScreenState("register")}
                        />
                    </View>
                </View>
            )
            }
            {
                screenState == "register" && (
                    <View className="bg-[#874CCC] m-2 h-2/3 p-4" style={{ borderRadius: 30 }}>

                        <Text className="text-white font-extrabold text-2xl">Register</Text>
                        <View className="mt-10 flex-row items-center" >
                            <AntDesign name="user" size={32} color="white" />
                            <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                                onChangeText={onChangeEmail}
                                value={email}
                                placeholder="Enter Email"
                            />
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons name="password" size={32} color="white" />
                            <TextInput className="flex-1" style={{ height: 40, margin: 10, color: "white", borderWidth: 1, borderColor: "white", borderRadius: 20, paddingStart: 20 }}
                                onChangeText={onChangePassword}
                                value={password}
                                placeholder="Enter Password"
                                // keyboardType='invisible-password'
                                secureTextEntry={true}
                            />
                        </View>
                        <View className="mt-5">
                            <Button className="mt-12"
                                title="Register"
                                color="#C65BCF"
                                onPress={registerHandler}
                            />
                            <View style={{ marginVertical: 30, borderBottomColor: 'white', borderBottomWidth: StyleSheet.hairlineWidth, }}></View>
                            <Button className="mt-10"
                                title="Login"
                                color="#F27BBD"
                                onPress={() => onChangeScreenState("login")}
                            />
                        </View>
                    </View>
                )
            }
            {showLoading && <Spinner size="large" />}


        </KeyboardAvoidingView >
    )
}

export default LoginScreen