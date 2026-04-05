import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { auth, createNewuser, loginUser } from '../firebase';
import { migrateOldDataIfNeeded, setDataForUsers, getCategories, getRecentTransactions, getTags, getLends, getUserProfile } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser, setProfileInfo } from './store/slice/appSlice';
import { setCategories, setTransactions, setTags, setLends } from './store/slice/dbSlice';

export default function LoginScreen({ navigation }) {
    const dispatch = useDispatch();

    const [initializing, setInitializing] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [screenState, setScreenState] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigateToHome = async (userId, type = "login") => {
        setActionLoading(true);
        setErrorMsg('');
        dispatch(setUser(userId));

        try {
            if (type === "login" || type === "auto-login") {
                if (type === "login") cacheData();
                
                await migrateOldDataIfNeeded(userId);

                const profile = await getUserProfile(userId);
                dispatch(setProfileInfo(profile));

                const categories = await getCategories(userId);
                dispatch(setCategories(categories));
                
                const tags = await getTags(userId);
                dispatch(setTags(tags));
                
                const lends = await getLends(userId);
                dispatch(setLends(lends));

                const { transactions, lastVisible } = await getRecentTransactions(userId, 20);
                dispatch(setTransactions({ transactions, lastVisible }));
                
            } else if (type === "register") {
                await new Promise((resolve) => {
                    setDataForUsers(userId, resolve);
                });
                dispatch(setProfileInfo({ username: 'New User', theme: 'dark' }));
                dispatch(setCategories([]));
                dispatch(setTransactions({ transactions: [], lastVisible: null }));
                dispatch(setTags([]));
                dispatch(setLends([]));
                cacheData();
            }

            setActionLoading(false);
            navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        } catch (error) {
            setActionLoading(false);
            setInitializing(false);
            setErrorMsg("Initialization failed. Please try again.");
            Alert.alert("Error", error.message);
        }
    };

    const handleLogin = () => {
        setErrorMsg('');
        if (!email || !password) {
            setErrorMsg('Please provide both Email and Password.');
            return;
        }
        setActionLoading(true);
        loginUser(auth, email, password)
            .then(userCredential => navigateToHome(userCredential.user.uid, "login"))
            .catch(error => {
                setActionLoading(false);
                if (error.message.includes("invalid-credential") || error.message.includes("INVALID_LOGIN_CREDENTIALS")) {
                    setErrorMsg("Invalid email or password.");
                } else if (error.message.includes("invalid-email")) {
                    setErrorMsg("Email address is badly formatted.");
                } else {
                    setErrorMsg("Login Error: " + error.message);
                }
            });
    };

    const handleRegister = () => {
        setErrorMsg('');
        if (!email || !password) {
            setErrorMsg('Please provide both Email and Password.');
            return;
        }
        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }
        setActionLoading(true);
        createNewuser(auth, email, password)
            .then(userCredential => navigateToHome(userCredential.user.uid, "register"))
            .catch(error => {
                setActionLoading(false);
                if (error.message.includes("email-already-in-use")) {
                    setErrorMsg("Email is already registered.");
                } else {
                    setErrorMsg("Error: " + error.message);
                }
            });
    };

    const cacheData = async () => {
        if (!email || !password) return;
        try {
            await AsyncStorage.setItem("email", email);
            await AsyncStorage.setItem("password", password);
        } catch (error) {}
    };

    useEffect(() => {
        const checkAutoLogin = async () => {
            try {
                const em = await AsyncStorage.getItem("email");
                if (em) setEmail(em);
                const pw = await AsyncStorage.getItem("password");
                if (pw) setPassword(pw);
            } catch (e) {}
        };
        checkAutoLogin();

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigateToHome(user.uid, 'auto-login');
            } else {
                setInitializing(false);
            }
        });
        return unsubscribe;
    }, []);

    if (initializing) {
        return (
            <View style={styles.splashContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.splashText}>Preparing Environment...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
                
                <View style={styles.header}>
                    <Text style={styles.title}>Track.</Text>
                    <Text style={styles.subtitle}>Minimalist expense management.</Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput 
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email Address"
                        placeholderTextColor="#86868B"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput 
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#86868B"
                        secureTextEntry
                    />

                    {errorMsg !== '' && (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    )}

                    {actionLoading ? (
                        <ActivityIndicator style={{marginTop: 20}} size="large" color="#007AFF" />
                    ) : (
                        <View style={styles.actionBlock}>
                            {screenState === 'login' ? (
                                <>
                                    <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                                        <Text style={styles.primaryBtnText}>Log In</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScreenState('register')}>
                                        <Text style={styles.secondaryBtnText}>Create Account</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
                                        <Text style={styles.primaryBtnText}>Register</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScreenState('login')}>
                                        <Text style={styles.secondaryBtnText}>Back to Log In</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'
    },
    splashText: { color: '#86868B', marginTop: 20, fontSize: 14, fontWeight: '500' },
    container: { flex: 1, backgroundColor: '#121212' },
    innerContainer: { flex: 1, justifyContent: 'center', padding: 30 },
    header: { marginBottom: 50 },
    title: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
    subtitle: { fontSize: 16, color: '#86868B', marginTop: 5 },
    formContainer: {},
    input: {
        height: 55, backgroundColor: '#1C1C1E', borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E',
        color: '#FFFFFF', paddingHorizontal: 20, fontSize: 16, marginBottom: 15
    },
    errorText: { color: '#FF453A', fontSize: 13, fontWeight: '500', marginBottom: 15, marginLeft: 5 },
    actionBlock: { marginTop: 10 },
    primaryBtn: {
        backgroundColor: '#0A84FF', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center'
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    secondaryBtn: {
        marginTop: 15, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center'
    },
    secondaryBtnText: { color: '#0A84FF', fontSize: 15, fontWeight: '600' }
});