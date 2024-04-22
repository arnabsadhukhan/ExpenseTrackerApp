import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function setDataForUsers(userId, data = [], transaction = []) {
    try {
        try {
            await setDoc(doc(db, "user-categories", userId), {
                categories: []
            });
            await setDoc(doc(db, "user-transactions", userId), {
                transaction: []
            });
        } catch (e) {
            console.error("FAILED To set Initial data for users ->  ", e);
        }
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export async function updateCategoriesForUsers(userId, data, successCallback = () => { }) {
    console.log("updateCategoriesForUsers", userId, data);
    try {
        try {
            await setDoc(doc(db, "user-categories", userId), {
                categories: data
            });
            successCallback();
        } catch (e) {
            console.error("FAILED To set New Categories data for users ->  ", e);
        }
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};
export async function updateTransactionsForUsers(userId, data, successCallback = () => { }) {
    console.log("updateTransactionsForUsers", userId, data);
    try {
        try {
            await setDoc(doc(db, "user-transactions", userId), {
                transactions: data
            });
            successCallback();

        } catch (e) {
            console.error("FAILED To set New Categories data for users ->  ", e);
        }
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};
export async function getCategoriesForUsers(userId, successCallback = () => { }) {
    console.log("getCategoriesForUsers", userId, data);
    const docRef = doc(db, "user-categories", userId);
    const docSnap = await getDoc(docRef);
    let userInfo = []
    try {
        if (docSnap.exists()) {
            userInfo = docSnap.data();
            console.log("GET USER Categories -> ", userInfo);
            successCallback(userInfo);
        } else {
            // docSnap.data() will be undefined in this case
            console.error(
                "FAILED TO GET USER INFO ->  ",
                "DOCUMENT DOES NOT EXIST IN DB"
            );
        }
        return userInfo;
    } catch (e) {
        console.error("FAILED TO GET USER CATEGORIES ->  ", e);
    }
};