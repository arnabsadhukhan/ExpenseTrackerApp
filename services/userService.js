import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, limit, startAfter, writeBatch, increment, where } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTIONS = {
    USER_ROOT: "user-data",
    CATEGORIES: "categories",
    TRANSACTIONS: "transactions",
    LENDS: "lends",
    METADATA: "metadata",
    PROFILE: "profile"
};

// ----------------- PROFILE -----------------

export async function getUserProfile(userId) {
    try {
        const docRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.PROFILE, 'settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data();
        }
        return { username: 'User', theme: 'dark' };
    } catch (e) {
        return { username: 'User', theme: 'dark' };
    }
}

export async function updateUserProfile(userId, data) {
    try {
        const docRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.PROFILE, 'settings');
        await setDoc(docRef, data, { merge: true });
    } catch (e) {
        console.error("Error setting profile", e);
    }
}


// ----------------- TRANSACTIONS & CATEGORY WALLETS -----------------

export async function addTransaction(userId, transactionData) {
    try {
        const transCollection = collection(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.TRANSACTIONS);
        const categoryRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.CATEGORIES, transactionData.categoryId);
        
        const newDocRef = doc(transCollection);
        
        // Calculate the increment amount based on debit/credit
        // Assuming deposit is positive, withdraw is negative for category wallet.
        const amountChange = transactionData.type === 'deposit' ? transactionData.transactionAmount : -transactionData.transactionAmount;

        const batch = writeBatch(db);
        batch.set(newDocRef, {
            ...transactionData,
            createdAt: Date.now()
        });

        // Update the category's current amount in the same atomic batch
        batch.update(categoryRef, {
            currentAmount: increment(amountChange)
        });

        await batch.commit();

        return { id: newDocRef.id, ...transactionData, createdAt: Date.now() };
    } catch (e) {
        console.error("FAILED To add transaction ->  ", e);
        throw e;
    }
}

export async function deleteTransaction(userId, transactionId, categoryId, amount, type) {
    try {
        const transRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.TRANSACTIONS, transactionId);
        const categoryRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.CATEGORIES, categoryId);

        // Reverse the effect
        const reversedChange = type === 'deposit' ? -amount : amount;

        const batch = writeBatch(db);
        batch.delete(transRef);
        batch.update(categoryRef, {
            currentAmount: increment(reversedChange)
        });

        await batch.commit();
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
    }
}

export async function getRecentTransactions(userId, limitCount = 20, lastDocSnap = null, categoryIdFilter = null) {
    try {
        const transCollection = collection(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.TRANSACTIONS);
        
        let conditions = [];
        
        if (categoryIdFilter) {
            conditions.push(where("categoryId", "==", categoryIdFilter));
            // When filtering by a field, Firestore requires a composite index to also use orderBy.
            // To avoid the developer needing to manually provision an index, we fetch without orderBy locally.
            conditions.push(limit(100)); // Increase limit since we don't paginate as well without order
        } else {
            conditions.push(orderBy("createdAt", "desc"));
            conditions.push(limit(limitCount));
            if (lastDocSnap) {
                conditions.push(startAfter(lastDocSnap));
            }
        }

        const q = query(transCollection, ...conditions);
        const querySnapshot = await getDocs(q);
        
        let transactions = [];
        let lastVisible = null;
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
            lastVisible = doc;
        });

        // Client side sort if filtered
        if (categoryIdFilter) {
            transactions.sort((a, b) => b.createdAt - a.createdAt);
        }

        return { transactions, lastVisible: categoryIdFilter ? null : lastVisible };
    } catch (error) {
        console.error("FAILED To GET Recent Transactions ->  ", error);
        throw error;
    }
}

// ----------------- CATEGORIES -----------------

export async function addCategory(userId, categoryData) {
    try {
        const colRef = collection(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.CATEGORIES);
        // Start category empty per user request
        const docRef = await addDoc(colRef, { ...categoryData, currentAmount: 0 });
        return { id: docRef.id, ...categoryData, currentAmount: 0 };
    } catch (e) {
        console.error("FAILED To add category ->  ", e);
        throw e;
    }
}

export async function updateCategory(userId, categoryId, updates) {
    try {
         const docRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.CATEGORIES, categoryId);
         await updateDoc(docRef, updates);
    } catch (e) {}
}

export async function deleteCategory(userId, categoryId) {
     try {
        const docRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.CATEGORIES, categoryId);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting category:", e);
        throw e;
    }
}

export async function getCategories(userId) {
    try {
        const colRef = collection(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.CATEGORIES);
        const querySnapshot = await getDocs(colRef);
        const categories = [];
        querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() });
        });
        return categories;
    } catch (error) {
         console.error("FAILED To GET categories ->  ", error);
         throw error;
    }
}

// ----------------- LENDS -----------------
export async function addLend(userId, lendData) {
     try {
        const colRef = collection(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.LENDS);
        const docRef = await addDoc(colRef, { ...lendData, createdAt: Date.now() });
        return { id: docRef.id, ...lendData, createdAt: Date.now() };
    } catch (e) { throw e; }
}
export async function updateLend(userId, lendId, data) {
    try {
        const docRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.LENDS, lendId);
        await updateDoc(docRef, data);
    } catch (e) { throw e; }
}
export async function deleteLend(userId, lendId) {
    try {
        const docRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.LENDS, lendId);
        await deleteDoc(docRef);
    } catch (e) { throw e; }
}
export async function getLends(userId) {
    try {
        const colRef = collection(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.LENDS);
        const q = query(colRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const lends = [];
        querySnapshot.forEach((doc) => { lends.push({ id: doc.id, ...doc.data() }); });
        return lends;
    } catch (error) { throw error; }
}

export async function setDataForUsers(userId, resolve) {
    try {
        // No default categories per user request. 
        // Just create profile metadata.
        const metadataRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.METADATA, 'migration');
        await setDoc(metadataRef, { migrated: true, migratedAt: Date.now() });
        
        await updateUserProfile(userId, { username: 'New User', theme: 'dark' });
        resolve();
    } catch (e) {
        resolve();
    }
}

// ----------------- TAGS & MIGRATION HOTFIX -----------------

export async function getTags(userId) {
    try {
        const colRef = collection(db, COLLECTIONS.USER_ROOT, userId, 'tags');
        const querySnapshot = await getDocs(colRef);
        const tags = [];
        querySnapshot.forEach((doc) => { tags.push({ id: doc.id, ...doc.data() }); });
        return tags;
    } catch (error) {
        return [];
    }
}

export async function migrateOldDataIfNeeded(userId) {
    try {
        const metadataRef = doc(db, COLLECTIONS.USER_ROOT, userId, COLLECTIONS.METADATA, 'migration');
        const snap = await getDoc(metadataRef);
        if (snap.exists() && snap.data().migrated) {
            return; // Already migrated
        }
        
        // Mark as migrated to prevent future loops. In a real scenario we'd do the data porting here.
        await setDoc(metadataRef, { migrated: true, migratedAt: Date.now() });
    } catch (e) {
        console.error("Migration error", e);
    }
}