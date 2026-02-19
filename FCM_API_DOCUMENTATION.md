# FCM Token Update API Documentation

This documentation covers the integration and usage of the Firebase Cloud Messaging (FCM) token update API for all user roles in the DinTask system.

## 1. Backend Endpoint

The system uses a centralized endpoint for updating FCM tokens. The backend identifies the user role based on the JWT token provided in the Authorization header.

### **Endpoint Details**
- **URL**: `{{BACKEND_URL}}/api/v1/notifications/fcm-token`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token)
- **Content-Type**: `application/json`

### **Request Body**
```json
{
  "token": "YOUR_FCM_REGISTRATION_TOKEN",
  "platform": "web" 
}
```
*Note: `platform` can be either `"web"` or `"app"`.*

### **Supported Roles**
The following roles are supported and their respective model records will be updated:
- **Employee**
- **Manager**
- **Sales Executive**
- **Admin**
- **Superadmin** (including root and staff)

### **Success Response (200 OK)**
```json
{
  "success": true,
  "message": "FCM web token updated successfully"
}
```

---

## 2. Frontend Implementation

The frontend is configured to automatically request notification permission and send the token to the backend upon successful login/authentication.

### **Location**: `Frontend/src/firebase.js`
The function `requestForToken()` handles the permission request and the API call.

### **Implementation Logic**:
1. Request browser notification permission.
2. If granted, retrieve the token from Firebase Messaging.
3. Call the `apiRequest` utility to send the token to the `/notifications/fcm-token` endpoint.

### **Integration in App**:
The token request is triggered in `Frontend/src/App.jsx` within a `useEffect` hook that monitors the authentication state:

```javascript
// From App.jsx
useEffect(() => {
  if (isAuthenticated) {
    fetchProfile();
    // Setup Push Notifications
    requestForToken();
  }
}, [isAuthenticated, fetchProfile]);
```

---

## 3. Database Schema

For all user models (Employee, Manager, etc.), the `fcmToken` is stored in the following structure:

```javascript
fcmToken: {
    app: { type: String, default: '' },
    web: { type: String, default: '' }
}
```

This allows a single user to stay connected via both a web browser and a mobile application simultaneously.

## 4. Troubleshooting

- **401 Unauthorized**: Ensure the `Authorization` header contains a valid `Bearer <token>`.
- **400 Bad Request**: Ensure the `platform` is either `"web"` or `"app"` and the `token` string is not empty.
- **Permission Denied**: If the user denies notification permission in the browser, the `requestForToken()` function will log `Notification permission denied.` and no API call will be made.
