# Subscription Expiry Access Control Implementation

## Overview
This implementation ensures that team members (employees, managers, sales executives) can only access their portals while the admin's subscription is active. When the subscription expires, new logins are blocked and existing sessions are terminated with a user-friendly notification.

## Implementation Components

### Backend Changes

#### 1. **Subscription Check Middleware** (`src/middleware/checkSubscription.js`)
- **Purpose**: Validates admin subscription status for team member requests
- **Applies to**: Employee, Manager, Sales Executive routes
- **Behavior**:
  - Checks if admin's `subscriptionExpiry` date has passed
  - Returns `403` status with `subscriptionExpired: true` flag if expired
  - Allows admins and superadmins to bypass check

#### 2. **Login Validation** (`src/controllers/authController.js`)
- **Added**: Subscription check in login flow (lines 190-224)
- **Behavior**:
  - Fetches admin details for team members
  - Compares expiry date with current time
  - Returns error response if subscription expired
  - Prevents new sessions from being created

#### 3. **Subscription Status Endpoint** (`src/controllers/authController.js`)
- **Route**: `GET /api/v1/auth/subscription-status`
- **Purpose**: Periodic subscription check for logged-in users
- **Response**:
```json
{
  "success": true/false,
  "subscriptionActive": true/false,
  "subscriptionExpired": true/false,
  "expiryDate": "2026-02-09T12:00:00.000Z",
  "message": "Error message if expired"
}
```

### Frontend Changes

#### 1. **Subscription Expired Modal** (`src/shared/components/SubscriptionExpiredModal.jsx`)
- **Features**:
  - Non-dismissible modal (prevents closing)
  - Clear expiry message
  - Forced logout button
  - Red theme to indicate critical action

#### 2. **API Interceptor** (`src/lib/api.js`)
- **Enhancement**: Detects subscription expiry in API responses
- **Behavior**:
  - Checks for `subscriptionExpired` flag or 403 status with subscription message
  - Dispatches custom `subscriptionExpired` event
  - Allows global subscription handling

#### 3. **Subscription Monitor Hook** (`src/hooks/useSubscriptionMonitor.js`)
- **Features**:
  - Periodic checks every 5 minutes
  - Event listener for API-triggered expiry
  - Only runs for team members
  - Auto-logout functionality
- **Usage**:
```javascript
const { showExpiredModal, handleLogout } = useSubscriptionMonitor();
```

#### 4. **App Integration** (`src/App.jsx`)
- **Added**:
  - Subscription monitor hook
  - Subscription expired modal component
  - Global subscription state management

## User Flow

### Scenario 1: Active Subscription
1. Team member logs in → Login successful
2. API requests execute normally
3. Periodic check every 5 minutes → Subscription active
4. User continues working

### Scenario 2: Subscription Expires While Logged In
1. Team member is actively using the system
2. Periodic check detects expiry OR API request triggers expiry event
3. Modal appears immediately
4. User clicks "Logout Now"
5. Redirected to login page

### Scenario 3: Attempting Login with Expired Subscription
1. Team member enters credentials
2. Backend validates subscription during login
3. Login rejected with error message
4. User sees: "Your organization's subscription has expired..."
5. Cannot proceed with login

## API Error Responses

### Login with Expired Subscription
```json
{
  "success": false,
  "subscriptionExpired": true,
  "error": "Your organization's subscription has expired. Please contact your administrator to renew the plan.",
  "expiryDate": "2026-02-09T12:00:00.000Z"
}
```

### API Request with Expired Subscription
```json
{
  "success": false,
  "subscriptionExpired": true,
  "message": "Organization subscription has expired",
  "expiryDate": "2026-02-09T12:00:00.000Z"
}
```

## Technical Details

### Backend
- **Middleware**: Applied to protected routes
- **Admin Model Fields Used**:
  - `subscriptionExpiry`: Date field
  - `subscriptionStatus`: String field
  - `subscriptionPlanId`: Reference to Plan

### Frontend
- **Check Interval**: 5 minutes (300,000 ms)
- **Event System**: Custom browser events
- **State Management**: React hooks + Zustand
- **Modal Library**: shadcn/ui Dialog

## Testing Checklist

### Backend
- [ ] Team member login with active subscription → Success
- [ ] Team member login with expired subscription → Blocked
- [ ] Admin login with expired subscription → Success
- [ ] API requests with expired subscription → 403 error
- [ ] Subscription status endpoint returns correct data

### Frontend
- [ ] Modal appears when subscription expires
- [ ] Modal cannot be dismissed (ESC/click outside)
- [ ] Logout button works correctly
- [ ] Periodic checks run every 5 minutes
- [ ] API error triggers modal immediately
- [ ] Non-team members don't see checks/modal

## Configuration

### Adjust Check Interval
In `src/hooks/useSubscriptionMonitor.js`:
```javascript
const interval = setInterval(checkSubscription, 5 * 60 * 1000); // 5 minutes
// Change to 2 minutes:
const interval = setInterval(checkSubscription, 2 * 60 * 1000);
```

### Customize Modal Message
In `src/shared/components/SubscriptionExpiredModal.jsx`:
```javascript
<DialogDescription>
  Your organization's subscription has expired...
</DialogDescription>
```

## Security Considerations

1. **Server-Side Validation**: All subscription checks are enforced on backend
2. **Token-Based**: Frontend cannot bypass checks without valid token
3. **Real-Time Detection**: API interceptor catches any subscription-related errors
4. **Forced Logout**: Modal prevents continued use after expiry detection

## Future Enhancements

1. **Grace Period**: Add configurable grace period after expiry
2. **Renewal Link**: Direct link to subscription page for admins
3. **Email Notifications**: Alert admins before expiry
4. **Usage Analytics**: Track blocked access attempts
5. **Offline Handling**: Handle subscription checks when offline

---

**Implementation Date**: 2026-02-09  
**Version**: 1.0.0  
**Status**: ✅ Complete and Ready for Testing
