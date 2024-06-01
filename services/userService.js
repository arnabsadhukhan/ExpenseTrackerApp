import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const COLLECTIONS = {
    CATEGORIES: "user-categories",
    TRANSACTIONS: "user-transactions",
    LOGS: "user-log"
}

async function updateDBLog(userId, type, data) {
    let documentType = type == COLLECTIONS.CATEGORIES ? COLLECTIONS.CATEGORIES : COLLECTIONS.TRANSACTIONS;
    documentType = documentType + "-" + new Date().toISOString().slice(0, 19);
    try {
        await updateDoc(doc(db, COLLECTIONS.LOGS, userId), {
            [documentType]: data
        });
        console.log("LOG UPDATED...");
    } catch (e) {
        try {
            await setDoc(doc(db, COLLECTIONS.LOGS, userId), {
                [documentType]: data
            });
            console.log("LOG UPDATED...");
        }
        catch (e) {
            console.error("FAILED To set LOG for tried once ->  ", e);
        }
        // if (e.startsWith("[FirebaseError: No document to update")) {
        //     await setDoc(doc(db, COLLECTIONS.LOGS, userId), {
        //         [documentType]: data
        //     });
        // } else {
        //     console.log("LOG UPDATED WITH CREATING A LOG USER...");
        // }

    }
}

export async function setDataForUsers(userId, successCallback = () => { }, errorCallback = () => { }) {
    try {
        await setDoc(doc(db, COLLECTIONS.CATEGORIES, userId), {
            categories: []
        });
        await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, userId), {
            transactions: []
        });
        successCallback();
        console.log("SET DATA FOR NEW USER SUCCESSFUL...");
    } catch (e) {
        console.error("FAILED To set Initial data for users ->  ", e);
        errorCallback("Failed To Set Data for users");
    }
};

export async function updateCategoriesForUsers(userId, data, successCallback = () => { }, errorCallback = () => { }) {
    try {
        let savePayload = data.map((category, index) => { category.id = index; return category });
        await setDoc(doc(db, COLLECTIONS.CATEGORIES, userId), {
            categories: savePayload
        });
        await updateDBLog(userId, COLLECTIONS.CATEGORIES, savePayload);
        successCallback();
        console.log("UPDATE CATEGORIES FOR USER SUCCESSFUL...");
    } catch (e) {
        console.error("FAILED To set New Categories data for users ->  ", e);
        errorCallback("Failed To Update categories");
    }

};

export async function updateTransactionsForUsers(userId, data, successCallback = () => { }, errorCallback = () => { }) {
    try {
        await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, userId), {
            transactions: data
        });
        await updateDBLog(userId, COLLECTIONS.TRANSACTIONS, data);
        successCallback();
        console.log("UPDATE TRANSACTION FOR USER SUCCESSFUL...");
    } catch (e) {
        console.error("FAILED To set New Categories data for users ->  ", e);
        errorCallback("Failed To Update Transaction");
    }

};

export async function deleteTransaction(userId, deleteTransactionDateId, successCallback = () => { }, errorCallback = () => { }) {
    let collectionName = COLLECTIONS.TRANSACTIONS;
    let documentId = userId;
    let arrayFieldName = "transactions";
    try {
        // Retrieve the document
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists) {
            console.log("Document not found.");
            return;
        }

        // Get the array field
        let dataArray = docSnapshot.data()[arrayFieldName];

        // Find index of object with matching value
        const index = dataArray.findIndex(obj => obj.date === deleteTransactionDateId); // Change 'someKey' to your key

        if (index !== -1) {
            // Remove the object from the array
            dataArray.splice(index, 1);

            // Update the document with the modified array
            await setDoc(doc(db, collectionName, documentId), {
                [arrayFieldName]: dataArray
            });
            await updateDBLog(userId, COLLECTIONS.TRANSACTIONS, dataArray);
            successCallback();
            console.log("DELETE TRANSACTION FOR USER SUCCESSFUL...");
        } else {
            console.log("Object with the specified value not found.");
            errorCallback("Failed To Delete Transaction - Transaction Doesn`t Exist");
        }
    } catch (error) {
        console.error("Error deleting object:", error);
        errorCallback("Failed To Delete Transaction");
    }
};

export async function getCategoriesForUsers(userId, successCallback = () => { }, errorCallback = () => { }) {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, userId);
    const docSnap = await getDoc(docRef);
    let userInfo = []
    try {
        if (docSnap.exists()) {
            userInfo = docSnap.data();
            successCallback(userInfo);
            console.log("GET CATEGORIES FOR USER SUCCESSFUL...");
        } else {
            // docSnap.data() will be undefined in this case
            console.error("FAILED TO GET USER INFO ->  ");
            errorCallback("Failed To Retrieve Categories - User Doesn`t Exist");
        }
        return userInfo;
    } catch (e) {
        console.error("FAILED TO GET USER CATEGORIES ->  ", e);
        errorCallback("Failed To Retrieve Categories");
    }
};

export async function getTransactionsForUsers(userId, successCallback = () => { }, errorCallback = () => { }) {
    const docRef = doc(db, COLLECTIONS.TRANSACTIONS, userId);
    const docSnap = await getDoc(docRef);
    let userInfo = []
    try {
        if (docSnap.exists()) {
            userInfo = docSnap.data();
            successCallback(userInfo);
            console.log("GET TRANSACTIONS FOR USER SUCCESSFUL...");
        } else {
            console.error("FAILED TO GET transactions INFO ->  ");
            errorCallback("Failed To Retrieve Transactions - User Doesn`t Exist");
        }
        return userInfo;
    } catch (e) {
        console.error("FAILED TO GET USER transactions ->  ", e);
        errorCallback("Failed To Retrieve Transactions");
    }
};