import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { addLend, updateLend, deleteLend } from '../services/userService';
import { setLends } from './store/slice/dbSlice';

export default function LendTrackerScreen() {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const userId = useSelector(state => state.app.userId);
    const lends = useSelector(state => state.db.lends);

    const [modalVisible, setModalVisible] = useState(false);
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const [selectedLend, setSelectedLend] = useState(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentComment, setPaymentComment] = useState('');

    const handleAddLend = async () => {
        if (!personName || !amount) return;
        try {
            const newLend = {
                personName, amount: parseFloat(amount), description, status: 'pending', refundedAmount: 0
            };
            const added = await addLend(userId, newLend);
            dispatch(setLends([added, ...lends]));
            setModalVisible(false);
            setPersonName(''); setAmount(''); setDescription('');
        } catch (e) {
            Alert.alert("Error", "Could not add lend record.");
        }
    };

    const handleMarkRefunded = async (lend) => {
        try {
            const finalRefunded = lend.amount;
            const fullHistory = lend.history ? [...lend.history] : [];
            
            // Add a final history entry for the remaining balance if it was a quick mark
            const remaining = lend.amount - (lend.refundedAmount || 0);
            if (remaining > 0) {
                fullHistory.push({ 
                    amount: remaining, 
                    date: Date.now(), 
                    comment: "Full recovery (Quick Mark)" 
                });
            }

            await updateLend(userId, lend.id, { status: 'refunded', refundedAmount: finalRefunded, history: fullHistory });
            const updatedLends = lends.map(l => l.id === lend.id ? { ...l, status: 'refunded', refundedAmount: finalRefunded, history: fullHistory } : l);
            dispatch(setLends(updatedLends));
        } catch (e) {
            console.error("Error marking refunded:", e);
            Alert.alert("Error", "Could not update lend status.");
        }
    };

    const handleAddPayment = async () => {
        const pAmount = parseFloat(paymentAmount);
        const remaining = selectedLend.amount - (selectedLend.refundedAmount || 0);

        if (isNaN(pAmount) || pAmount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a positive recovery amount.");
            return;
        }

        if (pAmount > remaining) {
            Alert.alert("Invalid Amount", `The amount exceeds the pending balance (₹${remaining.toLocaleString('en-IN')}).`);
            return;
        }
        
        try {
            const newRefundedAmount = (selectedLend.refundedAmount || 0) + pAmount;
            const newHistory = [...(selectedLend.history || []), {
                amount: pAmount,
                date: Date.now(),
                comment: paymentComment || "Partial recovery"
            }];
            
            const updates = {
                refundedAmount: newRefundedAmount,
                history: newHistory,
                status: newRefundedAmount >= selectedLend.amount ? 'refunded' : 'pending'
            };
            
            await updateLend(userId, selectedLend.id, updates);
            const updatedLends = lends.map(l => l.id === selectedLend.id ? { ...l, ...updates } : l);
            dispatch(setLends(updatedLends));
            
            setPaymentModalVisible(false);
            setPaymentAmount('');
            setPaymentComment('');
            setSelectedLend(null);
        } catch (e) {
            Alert.alert("Error", "Could not record payment.");
        }
    };

    const handleDeleteLend = async (lendId) => {
        const deleteAction = async () => {
            try {
                await deleteLend(userId, lendId);
                const updatedLends = lends.filter(l => l.id !== lendId);
                dispatch(setLends(updatedLends));
            } catch (e) {
                console.error("Delete Error:", e);
                Alert.alert("Error", "Could not delete lend record.");
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to remove this lend record?")) {
                await deleteAction();
            }
        } else {
            Alert.alert("Confirm Delete", "Are you sure you want to remove this lend record?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deleteAction }
            ]);
        }
    };

    const totalPending = lends.filter(l => l.status === 'pending').reduce((acc, curr) => acc + (curr.amount - (curr.refundedAmount || 0)), 0);

    const renderItem = ({ item }) => (
        <View style={[styles.lendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={styles.personInfo}>
                    <Ionicons name="person-circle" size={32} color={colors.primary} />
                    <Text style={[styles.personName, { color: colors.text }]}>{item.personName}</Text>
                </View>
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'refunded' ? '#34C75920' : '#FF3B3020' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'refunded' ? '#34C759' : '#FF3B30' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteLend(item.id)} style={styles.deleteIconBtn}>
                        <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.descText}>{item.description || "No specific details"}</Text>
                    <Text style={[styles.originalText, { color: colors.text + '80' }]}>Original: ₹ {item.amount.toLocaleString('en-IN')}</Text>
                </View>
                <Text style={[styles.amountText, { color: colors.text }]}>
                    ₹ {(item.amount - (item.refundedAmount || 0)).toLocaleString('en-IN')}
                    {item.status === 'pending' && <Text style={{fontSize: 10, color: '#86868B'}}> PENDING</Text>}
                </Text>
            </View>

            <View style={styles.actionRow}>
                {item.status === 'pending' && (
                    <>
                        <TouchableOpacity 
                            style={[styles.smallBtn, { borderColor: colors.primary }]} 
                            onPress={() => { setSelectedLend(item); setPaymentModalVisible(true); }}
                        >
                            <Text style={[styles.smallBtnText, { color: colors.primary }]}>Add Payment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.smallBtn, { borderColor: colors.border, marginLeft: 10 }]} 
                            onPress={() => handleMarkRefunded(item)}
                        >
                            <Text style={[styles.smallBtnText, { color: colors.primary }]}>Recovered</Text>
                        </TouchableOpacity>
                    </>
                )}
                {item.history && item.history.length > 0 && (
                    <TouchableOpacity 
                        style={[styles.smallBtn, { borderColor: colors.border, marginLeft: 10 }]} 
                        onPress={() => { setSelectedLend(item); setHistoryModalVisible(true); }}
                    >
                        <Text style={[styles.smallBtnText, { color: colors.text }]}>History ({item.history.length})</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.statsContainer, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}>
                <Text style={[styles.statsLabel, { color: colors.primary }]}>OUTSTANDING LENDS</Text>
                <Text style={[styles.statsValue, { color: colors.text }]}>₹ {totalPending.toLocaleString('en-IN')}</Text>
            </View>

            <FlatList 
                data={lends} keyExtractor={i => i.id} renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add" size={28} color="#FFF" />
            </TouchableOpacity>

            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>New Lend Entry</Text>
                        
                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Person Name" placeholderTextColor="#86868B" value={personName} onChangeText={setPersonName} />
                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Amount (₹)" keyboardType="numeric" placeholderTextColor="#86868B" value={amount} onChangeText={setAmount} />
                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Reason / Context" placeholderTextColor="#86868B" value={description} onChangeText={setDescription} />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddLend}>
                                <Text style={styles.saveText}>Save Record</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Payment Modal */}
            <Modal animationType="slide" transparent={true} visible={paymentModalVisible}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Add Partial Payment</Text>
                        {selectedLend && (
                            <Text style={{ color: '#86868B', marginBottom: 15 }}>
                                Remaining Balance: ₹ {(selectedLend.amount - (selectedLend.refundedAmount || 0)).toLocaleString('en-IN')}
                            </Text>
                        )}
                        <TextInput 
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
                            placeholder="Received Amount (₹)" 
                            keyboardType="numeric" 
                            placeholderTextColor="#86868B" 
                            value={paymentAmount} 
                            onChangeText={setPaymentAmount} 
                        />
                        <TextInput 
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
                            placeholder="Comment (Optional)" 
                            placeholderTextColor="#86868B" 
                            value={paymentComment} 
                            onChangeText={setPaymentComment} 
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setPaymentModalVisible(false)}>
                                <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddPayment}>
                                <Text style={styles.saveText}>Record Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* History Modal */}
            <Modal animationType="fade" transparent={true} visible={historyModalVisible}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, maxHeight: '80%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Payment History</Text>
                            <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                                {selectedLend?.personName}
                            </Text>
                            <Text style={{ color: '#86868B' }}>
                                Original Total: ₹ {selectedLend?.amount.toLocaleString('en-IN')}
                            </Text>
                        </View>

                        <FlatList 
                            data={[...(selectedLend?.history || [])].sort((a, b) => b.date - a.date)}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>₹ {item.amount.toLocaleString('en-IN')}</Text>
                                        <Text style={{ color: '#86868B', fontSize: 12 }}>{new Date(item.date).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={{ color: '#86868B', fontSize: 14 }}>{item.comment}</Text>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#86868B', padding: 20 }}>No history records found.</Text>}
                        />
                        
                        <TouchableOpacity 
                            style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 20, marginLeft: 0, flex: 0, width: '100%' }]} 
                            onPress={() => setHistoryModalVisible(false)}
                        >
                            <Text style={styles.saveText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    statsContainer: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    statsLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    statsValue: { fontSize: 32, fontWeight: '800', marginTop: 10 },
    list: { paddingBottom: 100 },
    lendCard: { padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    personInfo: { flexDirection: 'row', alignItems: 'center' },
    personName: { marginLeft: 10, fontSize: 16, fontWeight: '700' },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '800' },
    deleteIconBtn: { marginLeft: 15, padding: 5 },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    descText: { color: '#86868B', flex: 1 },
    amountText: { fontSize: 20, fontWeight: '700' },
    originalText: { fontSize: 11, fontWeight: '600', marginTop: 5 },
    actionRow: { flexDirection: 'row', marginTop: 15, alignItems: 'center' },
    smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    smallBtnText: { fontSize: 12, fontWeight: '700' },
    refundBtn: { padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    refundText: { fontWeight: '600' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5 },
    modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { padding: 25, borderRadius: 20, borderWidth: 1 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 15, fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { padding: 15, borderRadius: 12, borderWidth: 1, flex: 1, marginRight: 10, alignItems: 'center' },
    cancelText: { fontWeight: '600' },
    saveBtn: { padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center' },
    saveText: { color: '#FFF', fontWeight: '600' },
});
