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
            await updateLend(userId, lend.id, { status: 'refunded', refundedAmount: lend.amount });
            const updatedLends = lends.map(l => l.id === lend.id ? { ...l, status: 'refunded', refundedAmount: lend.amount } : l);
            dispatch(setLends(updatedLends));
        } catch (e) {
            Alert.alert("Error", "Could not update lend status.");
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

    const totalPending = lends.filter(l => l.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

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
                <Text style={styles.descText}>{item.description || "No specific details"}</Text>
                <Text style={[styles.amountText, { color: colors.text }]}>₹ {item.amount.toLocaleString('en-IN')}</Text>
            </View>

            {item.status === 'pending' && (
                <TouchableOpacity style={[styles.refundBtn, { borderColor: colors.border }]} onPress={() => handleMarkRefunded(item)}>
                    <Text style={[styles.refundText, { color: colors.primary }]}>Mark as Recovered</Text>
                </TouchableOpacity>
            )}
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
    refundBtn: { marginTop: 15, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
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
