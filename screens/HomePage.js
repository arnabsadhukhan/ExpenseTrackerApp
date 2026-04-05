import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { updateCategory } from '../services/userService';
import { updateCategoryState } from './store/slice/dbSlice';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CARD_WIDTH = (width - 40 - (CARD_MARGIN * 2)) / 2;

export default function HomePage({ navigation }) {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.app.userId);
    const categories = useSelector((state) => state.db.categories);
    const username = useSelector((state) => state.app.username);

    const totalBalance = useMemo(() => {
        return categories.reduce((sum, cat) => {
            if (cat.includeInTotal === false) return sum;
            return sum + (cat.currentAmount || 0);
        }, 0);
    }, [categories]);

    const totalIncome = useMemo(() => {
        return categories.reduce((sum, cat) => {
            if (cat.includeInTotal === false) return sum;
            const amt = cat.currentAmount || 0;
            return amt > 0 ? sum + amt : sum;
        }, 0);
    }, [categories]);

    const totalExpense = useMemo(() => {
        return categories.reduce((sum, cat) => {
            if (cat.includeInTotal === false) return sum;
            const amt = cat.currentAmount || 0;
            return amt < 0 ? sum + Math.abs(amt) : sum;
        }, 0);
    }, [categories]);

    const toggleVisibility = async (item) => {
        const newValue = !item.isHidden;
        dispatch(updateCategoryState({ id: item.id, updates: { isHidden: newValue } }));
        try {
            await updateCategory(userId, item.id, { isHidden: newValue });
        } catch (e) {
            dispatch(updateCategoryState({ id: item.id, updates: { isHidden: item.isHidden } }));
        }
    };

    const renderCategory = ({ item }) => {
        const isHidden = item.isHidden === true;
        const amt = item.currentAmount || 0;
        const isPositive = amt >= 0;
        const isExcluded = item.includeInTotal === false;

        return (
            <TouchableOpacity 
                style={[styles.walletCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('Transactions', { filterCategoryId: item.id, categoryName: item.categoryName })}
                activeOpacity={0.7}
            >
                <View style={styles.walletTop}>
                    <View style={[styles.iconBox, { backgroundColor: `${item.color || colors.primary}15` }]}>
                        <MaterialIcons name={item.icon || 'account-balance-wallet'} size={22} color={item.color || colors.primary} />
                    </View>
                    <TouchableOpacity onPress={() => toggleVisibility(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Ionicons name={isHidden ? "eye-off-outline" : "eye-outline"} size={18} color="#86868B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.walletBottom}>
                    <Text style={[styles.walletName, { color: colors.text }]} numberOfLines={1}>
                        {item.categoryName}
                    </Text>
                    
                    <Text style={[
                        styles.walletAmount, 
                        { color: isHidden ? '#86868B' : (isPositive ? '#34C759' : '#FF3B30') }
                    ]}>
                        {isHidden ? '••••••' : `₹${Math.abs(amt).toLocaleString('en-IN')}`}
                    </Text>

                    {isExcluded && (
                        <View style={styles.excludedTag}>
                            <Ionicons name="unlink-outline" size={10} color="#86868B" />
                            <Text style={styles.excludedTagText}>Excluded</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList 
                data={categories}
                keyExtractor={item => item.id}
                renderItem={renderCategory}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View>
                        {/* Greeting */}
                        <View style={styles.greetingArea}>
                            <Text style={styles.greetingText}>Hello, {username || 'User'}</Text>
                        </View>

                        {/* Balance Card */}
                        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={styles.balanceLabel}>NET BALANCE</Text>
                            <Text style={[styles.balanceValue, { color: colors.text }]}>
                                ₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>

                            <View style={styles.balanceSubRow}>
                                <View style={styles.balanceSubItem}>
                                    <Ionicons name="arrow-down-circle" size={16} color="#34C759" />
                                    <Text style={[styles.subAmount, { color: '#34C759' }]}>₹{totalIncome.toLocaleString('en-IN')}</Text>
                                    <Text style={styles.subLabel}>IN</Text>
                                </View>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                <View style={styles.balanceSubItem}>
                                    <Ionicons name="arrow-up-circle" size={16} color="#FF3B30" />
                                    <Text style={[styles.subAmount, { color: '#FF3B30' }]}>₹{totalExpense.toLocaleString('en-IN')}</Text>
                                    <Text style={styles.subLabel}>OUT</Text>
                                </View>
                            </View>
                        </View>

                        {/* Quick Add */}
                        <TouchableOpacity 
                            style={[styles.addBtnRow, { backgroundColor: colors.primary }]} 
                            onPress={() => navigation.navigate('Add Transactions')}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="add-circle-outline" size={22} color="#FFF" />
                            <Text style={styles.addBtnText}>New Transaction</Text>
                        </TouchableOpacity>

                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>YOUR WALLETS</Text>
                            <Text style={styles.sectionCount}>{categories.length}</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <MaterialIcons name="account-balance-wallet" size={48} color="#86868B" />
                        <Text style={styles.emptyText}>Create your first wallet to begin tracking.</Text>
                        <TouchableOpacity 
                            style={[styles.emptyBtn, { borderColor: colors.primary }]}
                            onPress={() => navigation.navigate('Manage Categories')}
                        >
                            <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Setup Wallets</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: {
        paddingHorizontal: 20 - CARD_MARGIN,
        paddingBottom: 30,
    },
    greetingArea: {
        paddingHorizontal: CARD_MARGIN,
        paddingTop: 15,
        paddingBottom: 5,
    },
    greetingText: {
        color: '#86868B',
        fontSize: 15,
        fontWeight: '500',
    },
    balanceCard: {
        margin: CARD_MARGIN,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 15,
    },
    balanceLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#86868B',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    balanceValue: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    balanceSubRow: {
        flexDirection: 'row',
        marginTop: 18,
        alignItems: 'center',
    },
    balanceSubItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    subAmount: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 6,
    },
    subLabel: {
        color: '#86868B',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
        letterSpacing: 1,
    },
    divider: {
        width: 1,
        height: 20,
        marginHorizontal: 10,
    },
    addBtnRow: {
        margin: CARD_MARGIN,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 14,
        marginBottom: 20,
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
        marginLeft: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: CARD_MARGIN + 5,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#86868B',
        letterSpacing: 1.5,
    },
    sectionCount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#86868B',
    },
    walletCard: {
        width: CARD_WIDTH,
        margin: CARD_MARGIN,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        height: 130,
        justifyContent: 'space-between',
    },
    walletTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletBottom: {},
    walletName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 3,
    },
    walletAmount: {
        fontSize: 17,
        fontWeight: '800',
    },
    excludedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    excludedTagText: {
        color: '#86868B',
        fontSize: 10,
        marginLeft: 3,
        fontWeight: '500',
    },
    emptyBox: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#86868B',
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 15,
        marginBottom: 20,
    },
    emptyBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    emptyBtnText: {
        fontWeight: '600',
    }
});