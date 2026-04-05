import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { getRecentTransactions } from '../services/userService';
import { useTheme } from '@react-navigation/native';

export default function Transactions({ navigation, route }) {
    const { colors } = useTheme();
    const userId = useSelector(state => state.app.userId);
    
    const filterCategoryId = route.params?.filterCategoryId || null;
    const categoryNameInput = route.params?.categoryName || 'History';

    const [transactions, setTransactions] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        navigation.setOptions({ title: categoryNameInput });
        fetchInitial();
    }, [filterCategoryId]);

    const fetchInitial = async () => {
        setLoading(true);
        try {
            const res = await getRecentTransactions(userId, 20, null, filterCategoryId);
            setTransactions(res.transactions);
            setLastVisible(res.lastVisible);
            setHasMore(res.transactions.length >= 20);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const loadMoreData = async () => {
        if (loadingMore || !hasMore || !lastVisible) return;
        setLoadingMore(true);
        try {
            const res = await getRecentTransactions(userId, 20, lastVisible, filterCategoryId);
            setTransactions([...transactions, ...res.transactions]);
            setLastVisible(res.lastVisible);
            setHasMore(res.transactions.length >= 20);
        } catch (e) {}
        setLoadingMore(false);
    };

    const renderTransaction = ({ item }) => {
        const isCredit = item.type === 'deposit';
        const dateString = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

        return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.catContainer}>
                        <MaterialIcons 
                            name={isCredit ? "call-received" : "call-made"} 
                            size={18} 
                            color={isCredit ? "#34C759" : "#FF3B30"} 
                        />
                        <Text style={[styles.dateText, { marginLeft: 8 }]}>{dateString}</Text>
                    </View>
                    <Text style={[styles.amountText, { color: isCredit ? '#34C759' : colors.text }]}>
                        {isCredit ? '+' : '-'} ₹{parseFloat(item.transactionAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
                
                <Text style={styles.commentText}>{item.comment || 'No description'}</Text>

                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.map((tag, idx) => (
                            <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.border }]}>
                                <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.centerEmpty}>
                        <FontAwesome5 name="receipt" size={32} color="#86868B" />
                        <Text style={styles.emptyText}>No records exist in this category.</Text>
                    </View>
                }
                ListFooterComponent={
                    loadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} /> : null
                }
            />
            {/* We remove the Floating Action Button from here, User should add via Home Page to keep logic clean */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 50 },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    catContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: '#86868B',
        fontSize: 12,
        fontWeight: '600',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
    },
    commentText: {
        color: '#86868B',
        fontSize: 14,
        marginTop: 5,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginTop: 15,
        flexWrap: 'wrap',
    },
    tagBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    centerEmpty: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        color: '#86868B',
        marginTop: 15,
        fontSize: 14,
    }
});