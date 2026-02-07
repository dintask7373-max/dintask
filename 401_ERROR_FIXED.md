# 401 Unauthorized - FIXED! ✅

## Problem
SuperAdmin panel mein "Save Section" click karne par 401 Unauthorized error aa raha tha.

## Root Cause
- **AuthStore** token ko `sessionStorage` mein store karta hai
- **LandingPageManager** `localStorage` se token read kar raha tha
- Result: Token nahi mil raha tha, isliye 401 error

## Solution
LandingPageManager ko update kiya:
- ❌ `localStorage.getItem('token')` (Wrong)
- ✅ `useAuthStore()` hook se token lena (Correct)

## How to Test

### Step 1: Login as SuperAdmin
```bash
1. Clear browser cache/storage (optional but recommended)
2. Go to: http://localhost:5173/superadmin/login
3. Login with:
   - Email: superadmin@dintask.com
   - Password: super123
4. Click "Secure Sign In"
```

### Step 2: Verify Token Exists
Open browser console and run:
```javascript
// Check sessionStorage (Should have token)
JSON.parse(sessionStorage.getItem('dintask-auth-storage'))

// Should show something like:
{
  state: {
    user: {...},
    role: "superadmin",
    token: "eyJhbGciOiJIUzI1NiIs...",
    isAuthenticated: true
  }
}
```

### Step 3: Test Landing Page Manager
```bash
1. Go to sidebar → Click "Landing Page"
2. Click "Reset to Default" button
3. Should see: "Default content initialized!" ✅
4. Click "Hero Section" from sidebar
5. Edit the title or subtitle
6. Click "Save Section"
7. Should see: "hero section updated successfully!" ✅
```

### Step 4: Verify on Landing Page
```bash
1. Click "Preview" button (or go to http://localhost:5173/)
2. Check hero section
3. Should show your edited content ✅
```

## Changes Made

### File: `LandingPageManager.jsx`

**Before:**
```javascript
import axios from 'axios';

const LandingPageManager = () => {
    // ... code

    const handleSaveSection = async (section) => {
        const token = localStorage.getItem('token'); // ❌ Wrong
        // ...
    };
};
```

**After:**
```javascript
import axios from 'axios';
import useAuthStore from '@/store/authStore';

const LandingPageManager = () => {
    const { token } = useAuthStore(); // ✅ Correct

    const handleSaveSection = async (section) => {
        if (!token) {
            showMessage('error', 'You must be logged in to save changes');
            return;
        }
        // ... use token from authStore
    };
};
```

## Additional Improvements

1. **Better Error Messages**: Now shows actual API error message
2. **Login Check**: Validates token exists before API call
3. **User Feedback**: Clear error if not logged in

## Troubleshooting

### Still getting 401?

**Check 1: Are you logged in?**
```javascript
// In browser console
JSON.parse(sessionStorage.getItem('dintask-auth-storage')).state.isAuthenticated
// Should return: true
```

**Check 2: Is token valid?**
```javascript
// In browser console
JSON.parse(sessionStorage.getItem('dintask-auth-storage')).state.token
// Should return a JWT string
```

**Check 3: Is backend running?**
```bash
# Backend should be running on port 5000
# Check terminal: "Server is running on port 5000"
```

**Check 4: Try re-login**
```bash
1. Logout from SuperAdmin
2. Clear sessionStorage: sessionStorage.clear()
3. Login again
4. Try saving again
```

### Getting "You must be logged in" message?

This means token is not in authStore. Solution:
1. Logout completely
2. Clear browser data
3. Login again as SuperAdmin
4. Token will be properly stored

### Backend says "Invalid token"?

1. Check if SuperAdmin user exists in MongoDB
2. Check if JWT_SECRET in .env matches between login and verification
3. Try re-registering SuperAdmin if needed

## Testing Checklist

- [ ] Can login as SuperAdmin ✅
- [ ] Token stored in sessionStorage ✅  
- [ ] Landing Page Manager loads ✅
- [ ] "Reset to Default" works ✅
- [ ] Can edit Hero Section ✅
- [ ] "Save Section" works (no 401) ✅
- [ ] Changes appear on landing page ✅
- [ ] Error messages are helpful ✅

## Summary

**Problem:** localStorage vs sessionStorage mismatch
**Solution:** Use authStore's token directly
**Result:** Save functionality fully working! 🎉

---

**Fixed:** 2026-02-07  
**Status:** ✅ Resolved
