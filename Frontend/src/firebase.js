import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import apiRequest from "./lib/api";

const firebaseConfig = {
    apiKey: "AIzaSyBli5aJTsxm7wd_EaIq3ih_eqmD1hoCPQY",
    authDomain: "dintask-9c3da.firebaseapp.com",
    projectId: "dintask-9c3da",
    storageBucket: "dintask-9c3da.firebasestorage.app",
    messagingSenderId: "1038003684212",
    appId: "1:1038003684212:web:754f873c210c8a49882221",
    measurementId: "G-NMQBGDP8G7"
};

const app = initializeApp(firebaseConfig);

let messaging = null;
try {
    // Basic check for environment support before initializing messaging
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.warn("Firebase Messaging not supported in this environment:", error);
}

export const requestForToken = async () => {
    if (!messaging) return null;
    try {
        if (!('Notification' in window)) {
            console.log("This browser does not support notifications.");
            return null;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const currentToken = await getToken(messaging, {
                vapidKey: "BGQ9U_9ew80N1olfXFOJWX09VnGhG9ULX9K3YRRu2j5mDb93H6S5HOfWia35hYMPKV1HIk0P6QTWkWrxnLqGMbk",
            });
            if (currentToken) {
                console.log("FCM Token:", currentToken);
                // Send token to backend
                await apiRequest("/notifications/fcm-token", {
                    method: "PUT",
                    body: {
                        token: currentToken,
                        platform: "web",
                    },
                });
                return currentToken;
            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        } else {
            console.log("Notification permission denied.");
        }
    } catch (err) {
        console.log("An error occurred while retrieving token. ", err);
    }
};

export const onMessageListener = (callback) => {
    if (!messaging) return () => {};
    return onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        callback(payload);
    });
};

export default app;
