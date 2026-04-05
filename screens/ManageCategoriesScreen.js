import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { addCategory, deleteCategory, updateCategory } from '../services/userService';
import { setCategories, updateCategoryState } from './store/slice/dbSlice';

export default function ManageCategoriesScreen() {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const userId = useSelector(state => state.app.userId);
    const categories = useSelector(state => state.db.categories);

    const AVAILABLE_ICONS = ['folder', 'account-balance-wallet', 'shopping-cart', 'directions-car', 'flight', 'restaurant', 'local-hospital', 'home', 'school', 'build', 'pets', 'fitness-center', 'videogame-asset'];

    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('account-balance-wallet');
    const [includeInTotal, setIncludeInTotal] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setLoading(true);
        try {
            const addedCat = await addCategory(userId, { 
                categoryName: newCategoryName, 
                color: colors.primary, 
                icon: selectedIcon,
                includeInTotal: includeInTotal,
                isHidden: false
            });
            dispatch(setCategories([...categories, addedCat]));
            setNewCategoryName('');
            setSelectedIcon('account-balance-wallet');
            setIncludeInTotal(true);
        } catch (error) {
            Alert.alert("Error", "Could not add category");
        }
        setLoading(false);
    };

    const handleDelete = async (catId) => {
        if (!catId) return;
        Alert.alert("Confirm Delete", "Are you sure you want to delete this Wallet? Transactions won't be deleted, but they'll be unlinked from the home page.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                setLoading(true);
                try {
                    await deleteCategory(userId, catId);
                    dispatch(setCategories(categories.filter(c => c.id !== catId)));
                } catch (e) {
                    Alert.alert("Error", "Could not delete category");
                }
                setLoading(false);
            }}
        ]);
    };

    const toggleExistingCategorySetting = async (catId, field, currentValue) => {
        const newValue = !currentValue;
        // Optimistic update
        dispatch(updateCategoryState({ id: catId, updates: { [field]: newValue } }));
        try {
            await updateCategory(userId, catId, { [field]: newValue });
        } catch (e) {
            // Rollback optimistic update
            dispatch(updateCategoryState({ id: catId, updates: { [field]: currentValue } }));
            Alert.alert("Error", "Failed to sync setting to cloud.");
        }
    };


    const renderIconItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.iconPickerItem, selectedIcon === item && { backgroundColor: `${colors.primary}40`, borderColor: colors.primary }]}
            onPress={() => setSelectedIcon(item)}
        >
            <MaterialIcons name={item} size={24} color={selectedIcon === item ? colors.primary : '#86868B'} />
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        // Fallback for older categories without the explicit properties
        const isIncluded = item.includeInTotal !== false; 
        const isHidden = item.isHidden === true;

        return (
            <View style={[styles.catCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                
                <View style={styles.catHeaderRow}>
                    <View style={styles.catInfo}>
                        <View style={[styles.iconBox, { backgroundColor: `${item.color || colors.primary}20` }]}>
                            <MaterialIcons name={item.icon || 'account-balance-wallet'} size={24} color={item.color || colors.primary} />
                        </View>
                        <Text style={[styles.catText, { color: colors.text }]}>{item.categoryName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                <View style={styles.catControls}>
                    <View style={styles.controlRow}>
                        <Text style={[styles.controlLabel, { color: colors.text }]}>Sum to Net Balance</Text>
                        <Switch
                            value={isIncluded}
                            onValueChange={() => toggleExistingCategorySetting(item.id, 'includeInTotal', isIncluded)}
                            trackColor={{ true: colors.primary }}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                    <View style={styles.controlRow}>
                        <Text style={[styles.controlLabel, { color: colors.text }]}>Mask Amount Locally</Text>
                        <Switch
                            value={isHidden}
                            onValueChange={() => toggleExistingCategorySetting(item.id, 'isHidden', isHidden)}
                            trackColor={{ true: colors.primary }}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : ''}
        >
            <FlatList 
                data={categories}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <View style={[styles.formBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.formTitle, { color: colors.text }]}>Configure New Wallet</Text>
                        
                        <TextInput 
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholder="E.g., Personal Savings"
                            placeholderTextColor="#86868B"
                        />

                        <Text style={styles.iconSelectLabel}>Select Cover Icon:</Text>
                        <FlatList 
                            data={AVAILABLE_ICONS}
                            horizontal
                            keyExtractor={item => item}
                            renderItem={renderIconItem}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.iconListContent}
                            style={{ marginBottom: 15 }}
                        />

                        <View style={styles.switchRow}>
                            <View style={styles.switchLabelContainer}>
                                <Text style={[styles.switchLabel, { color: colors.text }]}>Count in Total Balance</Text>
                                <Text style={styles.switchSub}>If off, amounts won't reflect in dashboard sum.</Text>
                            </View>
                            <Switch
                                value={includeInTotal}
                                onValueChange={setIncludeInTotal}
                                trackColor={{ true: colors.primary }}
                            />
                        </View>

                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleAddCategory} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <MaterialIcons name="add" size={20} color="#FFF" />
                                    <Text style={styles.submitText}>Add Wallet Config</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                }
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    formBox: {
        margin: 20,
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        marginBottom: 10,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    iconSelectLabel: {
        color: '#86868B',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 10,
    },
    iconPickerItem: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    iconListContent: { paddingRight: 20 },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabelContainer: { flex: 1, paddingRight: 10 },
    switchLabel: { fontSize: 14, fontWeight: '600' },
    switchSub: { fontSize: 11, color: '#86868B', marginTop: 2 },
    submitBtn: {
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    list: { paddingBottom: 50 },
    catCard: {
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 20,
        marginBottom: 12,
    },
    catHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    catInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: {
        width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    catText: { fontSize: 16, fontWeight: '700' },
    deleteBtn: { padding: 5 },
    catControls: {
        borderTopWidth: 1,
        borderTopColor: '#415A7740', // very subtle separator
        paddingTop: 10,
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 2,
    },
    controlLabel: {
        fontSize: 12,
        fontWeight: '500',
    }
});
