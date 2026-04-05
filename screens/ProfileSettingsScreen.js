import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../services/userService';
import { setProfileInfo } from './store/slice/appSlice';
import { auth, logOutUser } from '../firebase';

export default function ProfileSettingsScreen({ navigation }) {
    const dispatch = useDispatch();
    const userId = useSelector(state => state.app.userId);
    const { username, theme } = useSelector(state => state.app);
    
    const [name, setName] = useState(username);
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [loading, setLoading] = useState(false);

    const isDark = selectedTheme === 'dark';

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUserProfile(userId, { username: name, theme: selectedTheme });
            dispatch(setProfileInfo({ username: name, theme: selectedTheme }));
            Alert.alert("Success", "Profile updated securely.");
        } catch (e) {
            Alert.alert("Error", "Could not update profile.");
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logOutUser(auth).then(() => {
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        });
    };

    const dynamicStyles = {
        container: { backgroundColor: isDark ? '#121212' : '#F5F5F7' },
        textTitle: { color: isDark ? '#FFFFFF' : '#1D1D1F' },
        textDesc: { color: isDark ? '#A1A1A6' : '#86868B' },
        input: { 
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', 
            color: isDark ? '#FFFFFF' : '#1D1D1F',
            borderColor: isDark ? '#2C2C2E' : '#E5E5EA'
        },
        card: {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderColor: isDark ? '#2C2C2E' : '#E5E5EA'
        }
    };

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            <View style={styles.content}>
                
                <Text style={[styles.label, dynamicStyles.textDesc]}>DISPLAY NAME</Text>
                <TextInput 
                    style={[styles.input, dynamicStyles.input]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#86868B"
                />

                <Text style={[styles.label, dynamicStyles.textDesc, { marginTop: 20 }]}>THEME PREFERENCE</Text>
                <View style={[styles.themeRow, dynamicStyles.card]}>
                    <TouchableOpacity 
                        style={[styles.themeBtn, selectedTheme === 'light' && styles.themeBtnActiveLight]}
                        onPress={() => setSelectedTheme('light')}
                    >
                        <Text style={[styles.themeText, selectedTheme === 'light' && styles.themeTextActiveLight]}>LIGHT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.themeBtn, selectedTheme === 'dark' && styles.themeBtnActiveDark]}
                        onPress={() => setSelectedTheme('dark')}
                    >
                        <Text style={[styles.themeText, selectedTheme === 'dark' && styles.themeTextActiveDark]}>DARK</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>LOG OUT</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
    input: {
        height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, fontSize: 16
    },
    themeRow: {
        flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 5, marginBottom: 40
    },
    themeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    themeBtnActiveLight: { backgroundColor: '#E5E5EA' },
    themeBtnActiveDark: { backgroundColor: '#2C2C2E' },
    themeText: { fontSize: 14, fontWeight: '600', color: '#86868B' },
    themeTextActiveLight: { color: '#1D1D1F' },
    themeTextActiveDark: { color: '#FFFFFF' },
    saveBtn: {
        backgroundColor: '#007AFF', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20
    },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    logoutBtn: {
        borderWidth: 1, borderColor: '#FF3B30', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center'
    },
    logoutBtnText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 }
});
