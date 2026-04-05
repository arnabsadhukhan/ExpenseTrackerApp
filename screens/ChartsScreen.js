import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { getRecentTransactions } from '../services/userService';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

const PERIODS = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
];

export default function ChartsScreen() {
    const { colors } = useTheme();
    const userId = useSelector(state => state.app.userId);
    const categories = useSelector(state => state.db.categories);

    const [activePeriod, setActivePeriod] = useState('daily');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null = all
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllTransactions();
    }, [selectedCategoryId]);

    const loadAllTransactions = async () => {
        setLoading(true);
        try {
            const res = await getRecentTransactions(userId, 200, null, selectedCategoryId);
            setTransactions(res.transactions);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const aggregatedData = useMemo(() => {
        if (!transactions.length) return { labels: [], credits: [], debits: [] };

        const buckets = {};

        transactions.forEach(t => {
            const d = new Date(t.createdAt);
            let key;
            switch (activePeriod) {
                case 'daily':
                    key = `${d.getDate()}/${d.getMonth() + 1}`;
                    break;
                case 'weekly': {
                    const startOfYear = new Date(d.getFullYear(), 0, 1);
                    const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                    key = `W${weekNum}`;
                    break;
                }
                case 'monthly':
                    key = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
                    break;
                case 'yearly':
                    key = String(d.getFullYear());
                    break;
                default:
                    key = `${d.getDate()}/${d.getMonth() + 1}`;
            }

            if (!buckets[key]) buckets[key] = { credit: 0, debit: 0 };
            const amt = parseFloat(t.transactionAmount || 0);
            if (t.type === 'deposit') {
                buckets[key].credit += amt;
            } else {
                buckets[key].debit += amt;
            }
        });

        const labels = Object.keys(buckets).slice(-7); // show last 7 data points
        const credits = labels.map(l => buckets[l].credit);
        const debits = labels.map(l => buckets[l].debit);

        return { labels, credits, debits };
    }, [transactions, activePeriod]);

    const chartConfig = {
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(10, 132, 255, ${opacity})`,
        labelColor: () => '#86868B',
        propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
        propsForBackgroundLines: { stroke: colors.border },
    };

    const hasData = aggregatedData.labels.length > 0;

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>

            {/* Category Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                <TouchableOpacity
                    style={[styles.catChip, !selectedCategoryId && { backgroundColor: colors.primary }]}
                    onPress={() => setSelectedCategoryId(null)}
                >
                    <Text style={[styles.catChipText, !selectedCategoryId && { color: '#FFF' }]}>All</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.catChip, selectedCategoryId === cat.id && { backgroundColor: colors.primary }]}
                        onPress={() => setSelectedCategoryId(cat.id)}
                    >
                        <Text style={[styles.catChipText, selectedCategoryId === cat.id && { color: '#FFF' }]}>
                            {cat.categoryName}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Period Selector */}
            <View style={[styles.periodRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {PERIODS.map(p => (
                    <TouchableOpacity
                        key={p.key}
                        style={[styles.periodBtn, activePeriod === p.key && { backgroundColor: colors.primary }]}
                        onPress={() => setActivePeriod(p.key)}
                    >
                        <Text style={[styles.periodText, activePeriod === p.key && { color: '#FFF' }]}>{p.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
            ) : !hasData ? (
                <View style={styles.emptyBlock}>
                    <Ionicons name="bar-chart-outline" size={48} color="#86868B" />
                    <Text style={styles.emptyText}>No transaction data to plot.</Text>
                </View>
            ) : (
                <>
                    {/* Credits Line Chart */}
                    <View style={styles.chartSection}>
                        <Text style={[styles.chartTitle, { color: '#34C759' }]}>
                            <Ionicons name="trending-up" size={16} /> Credits / Income
                        </Text>
                        <LineChart
                            data={{
                                labels: aggregatedData.labels,
                                datasets: [{ data: aggregatedData.credits.length ? aggregatedData.credits : [0] }]
                            }}
                            width={CHART_WIDTH}
                            height={200}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                                propsForDots: { r: '4', strokeWidth: '2', stroke: '#34C759' },
                            }}
                            bezier
                            style={styles.chartStyle}
                        />
                    </View>

                    {/* Debits Bar Chart */}
                    <View style={styles.chartSection}>
                        <Text style={[styles.chartTitle, { color: '#FF3B30' }]}>
                            <Ionicons name="trending-down" size={16} /> Debits / Expenses
                        </Text>
                        <BarChart
                            data={{
                                labels: aggregatedData.labels,
                                datasets: [{ data: aggregatedData.debits.length ? aggregatedData.debits : [0] }]
                            }}
                            width={CHART_WIDTH}
                            height={200}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
                            }}
                            style={styles.chartStyle}
                            showBarTops={false}
                        />
                    </View>

                    {/* Summary */}
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Credits (Shown)</Text>
                            <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                                ₹ {aggregatedData.credits.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }]}>
                            <Text style={styles.summaryLabel}>Total Debits (Shown)</Text>
                            <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                                ₹ {aggregatedData.debits.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    catScroll: { marginBottom: 15 },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#2C2C2E',
        marginRight: 8,
    },
    catChipText: {
        color: '#86868B',
        fontSize: 13,
        fontWeight: '600',
    },
    periodRow: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 25,
        borderWidth: 1,
    },
    periodBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    periodText: { color: '#86868B', fontWeight: '600', fontSize: 13 },
    emptyBlock: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#86868B', marginTop: 15, fontSize: 14 },
    chartSection: { marginBottom: 25 },
    chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
    chartStyle: { borderRadius: 16 },
    summaryCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryLabel: { color: '#86868B', fontWeight: '600' },
    summaryValue: { fontWeight: '800', fontSize: 16 },
});
