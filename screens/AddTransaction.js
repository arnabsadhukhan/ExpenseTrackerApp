import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import CustomDatePicker from './components/CustomDatePicker';
import { addTransaction, updateTransaction, deleteTransaction, getCategories } from '../services/userService';
import { setCategories } from './store/slice/dbSlice';

export default function AddTransaction({ navigation, route }) {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const categories = useSelector((state) => state.db.categories);

    // Check if we are in EDIT mode
    const editItem = route.params?.transaction || null;
    const isEdit = !!editItem;

    const [selectedCategoryId, setSelectedCategoryId] = useState(editItem?.categoryId || '');
    const [amount, setAmount] = useState(editItem?.transactionAmount?.toString() || '');
    const [comment, setComment] = useState(editItem?.comment || '');
    const [type, setType] = useState(editItem?.type || 'withdraw'); 
    const [date, setDate] = useState(editItem?.createdAt ? new Date(editItem.createdAt) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            navigation.setOptions({ title: 'Edit Transaction' });
        }
    }, [isEdit]);

    const categoriesList = categories.map(c => ({ label: c.categoryName, value: c.id }));

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

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
                createdAt: date.getTime()
            };

            if (isEdit) {
                await updateTransaction(userId, editItem.id, editItem, transactionData);
            } else {
                await addTransaction(userId, transactionData);
            }
            
            // Sync Category balances
            const updatedCategories = await getCategories(userId);
            dispatch(setCategories(updatedCategories));

            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Could not save transaction.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        const title = "Delete Transaction";
        const message = "Are you sure you want to remove this record? This will also revert the balance in your wallet.";

        if (Platform.OS === 'web') {
            // Standard web confirmation
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed) {
                confirmDelete();
            }
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: confirmDelete }
                ]
            );
        }
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await deleteTransaction(userId, editItem.id, editItem.categoryId, editItem.transactionAmount, editItem.type);
            const updatedCategories = await getCategories(userId);
            dispatch(setCategories(updatedCategories));
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to delete.");
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
                <Text style={styles.label}>DATE</Text>
                <TouchableOpacity 
                    style={[styles.input, styles.datePickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ color: colors.text, fontSize: 16 }}>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                
                {/* CustomDatePicker handles both platform-native and web behavior */}
                <CustomDatePicker 
                    show={showDatePicker}
                    value={date}
                    onChange={onChangeDate}
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
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>{isEdit ? 'Update Entry' : 'Commit Transaction'}</Text>}
            </TouchableOpacity>

            {isEdit && (
                <TouchableOpacity 
                    style={[styles.outlineBtn, { borderColor: '#FF3B30', marginTop: 15 }]} 
                    onPress={handleDelete}
                    disabled={loading}
                >
                    <Text style={styles.deleteBtnText}>Delete Transaction</Text>
                </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
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
    datePickerBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    outlineBtn: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    deleteBtnText: {
        color: '#FF3B30',
        fontWeight: '700',
        fontSize: 16,
    }
});