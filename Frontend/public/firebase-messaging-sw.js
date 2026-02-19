importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBli5aJTsxm7wd_EaIq3ih_eqmD1hoCPQY",
    authDomain: "dintask-9c3da.firebaseapp.com",
    projectId: "dintask-9c3da",
    storageBucket: "dintask-9c3da.firebasestorage.app",
    messagingSenderId: "1038003684212",
    appId: "1:1038003684212:web:754f873c210c8a49882221",
    measurementId: "G-NMQBGDP8G7"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message:", payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationBody = payload.notification?.body || '';
    const link = payload.data?.link || '/';

    const notificationOptions = {
        body: notificationBody,
        icon: payload.notification?.image || '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: {
            url: link
        },
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the app and navigate to the link
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/';
    const fullUrl = self.location.origin + url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app tab already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(fullUrl);
                    return;
                }
            }
            // Otherwise open a new tab
            if (clients.openWindow) {
                return clients.openWindow(fullUrl);
            }
        })
    );
});
