import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { addTransaction, getCategories } from '../services/userService';
import { setCategories } from './store/slice/dbSlice';

export default function AddTransaction({ navigation }) {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const categories = useSelector((state) => state.db.categories);

    
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');
    const [type, setType] = useState('withdraw'); // 'withdraw' (expense) or 'deposit' (income)
    const [loading, setLoading] = useState(false);

    const categoriesList = categories.map(c => ({ label: c.categoryName, value: c.id }));

    const handleSave = async () => {
        if (!selectedCategoryId || !amount || parseFloat(amount) <= 0) {
            Alert.alert("Validation", "Please provide a valid category and amount.");
            return;
        }

        setLoading(true);
        try {
            const transactionData = {
                categoryId: selectedCategoryId,
                transactionAmount: parseFloat(amount),
                type: type,
                comment: comment,
            };

            await addTransaction(userId, transactionData);
            
            // Re-fetch categories to sync the wallet balances
            const updatedCategories = await getCategories(userId);
            dispatch(setCategories(updatedCategories));

            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Could not save transaction.");
        } finally {
            setLoading(false);
        }
    };

    if (categories.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background }]}>
                <MaterialIcons name="folder-off" size={48} color="#86868B" />
                <Text style={styles.emptyText}>You must create a Category Wallet first before adding a transaction.</Text>
                <TouchableOpacity 
                    style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                    onPress={() => navigation.navigate('Manage Categories')}
                >
                    <Text style={styles.btnText}>Setup Categories</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            
            <View style={[styles.typeSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity 
                    style={[styles.typeBtn, type === 'withdraw' && { backgroundColor: '#FF3B30' }]}
                    onPress={() => setType('withdraw')}
                >
                    <Text style={[styles.typeText, type === 'withdraw' && styles.typeTextActive]}>Debit / Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.typeBtn, type === 'deposit' && { backgroundColor: '#34C759' }]}
                    onPress={() => setType('deposit')}
                >
                    <Text style={[styles.typeText, type === 'deposit' && styles.typeTextActive]}>Credit / Income</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>AMOUNT (₹)</Text>
                <TextInput 
                    style={[styles.input, styles.amountInput, { backgroundColor: colors.card, borderColor: colors.border, color: type === 'deposit' ? '#34C759' : '#FF3B30' }]}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#86868B"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>CATEGORY WALLET</Text>
                <Dropdown
                    style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={[styles.selectedTextStyle, { color: colors.text }]}
                    data={categoriesList}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Target Wallet"
                    value={selectedCategoryId}
                    onChange={item => setSelectedCategoryId(item.value)}
                    activeColor={`${colors.primary}20`}
                    containerStyle={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
                    itemTextStyle={{ color: colors.text }}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>COMMENTS / DESCRIPTION</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Enter context..."
                    placeholderTextColor="#86868B"
                />
            </View>



            <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 10 }]} 
                onPress={handleSave} 
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Commit Transaction</Text>}
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    emptyContainer: { justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { color: '#86868B', textAlign: 'center', marginTop: 20, fontSize: 16 },
    content: { padding: 20 },
    typeSelector: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 25,
        borderWidth: 1,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    typeText: {
        color: '#86868B',
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#86868B',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
        fontSize: 16,
    },
    amountInput: {
        fontSize: 24,
        fontWeight: '800',
    },
    dropdown: {
        borderWidth: 1,
        borderRadius: 12,
        height: 55,
        paddingHorizontal: 15,
    },
    placeholderStyle: {
        color: '#86868B',
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },

    primaryBtn: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    }
});