const admin = require('firebase-admin');

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64) {
  console.warn('⚠️  WARNING: FIREBASE_SERVICE_ACCOUNT_BASE64 is missing. Push notifications will be disabled.');
  module.exports = {
    messaging: () => ({
      send: async () => { console.warn('[Push] Firebase not initialized — skipping push.'); },
      sendEachForMulticast: async () => { console.warn('[Push] Firebase not initialized — skipping push.'); return { successCount: 0, failureCount: 0, responses: [] }; }
    })
  };
} else {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(base64, 'base64').toString('utf-8')
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized successfully');
    }

    module.exports = admin;
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
    module.exports = {
      messaging: () => ({
        send: async () => { console.warn('[Push] Firebase init failed — skipping push.'); },
        sendEachForMulticast: async () => { return { successCount: 0, failureCount: 0, responses: [] }; }
      })
    };
  }
}
