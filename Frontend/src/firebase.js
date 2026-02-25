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
const messaging = getMessaging(app);

export const requestForToken = async () => {
    try {
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
    return onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        callback(payload);
    });
};

export default app;
