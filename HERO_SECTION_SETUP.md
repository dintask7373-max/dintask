# Landing Page Hero Section - Setup & Testing Guide

## 🚀 Quick Start Guide

### Step 1: Initialize Database Content

SuperAdmin panel mein jao aur default content initialize karo:

1. **Login as SuperAdmin**
   - URL: `http://localhost:5173/superadmin/login`
   
2. **Go to Landing Page Manager**
   - Sidebar se "Landing Page" par click karo
   
3. **Initialize Default Content**
   - Top right mein "Reset to Default" button par click karo
   - Success message aayega: "Default content initialized!"

### Step 2: Verify Hero Section in SuperAdmin

1. **Click on "Hero Section" from sidebar**
2. **You should see:**
   - Hero Title: "Your work,\nPowered by\nour life's work."
   - Hero Subtitle: "An all-in-one workspace designed..."

3. **Try Editing:**
   - Change title to: "Build Better,\nPowered by\nInnovation."
   - Change subtitle to: "Transform your workflow today."
   - Click "Save Section"
   - Success message: "hero section updated successfully!"

### Step 3: Verify on Landing Page

1. **Open Landing Page**
   - URL: `http://localhost:5173/`
   
2. **Check Hero Section**
   - Should show the updated text
   - "Powered" word should be in blue color
   - Subtitle should match

## 🔄 Complete Flow Verification

### Backend → Frontend Flow

```
1. SuperAdmin edits hero section
   ↓
2. Clicks "Save Section"
   ↓
3. Frontend sends PUT request to:
   http://localhost:5000/api/v1/landing-page/hero
   ↓
4. Backend saves to MongoDB
   ↓
5. Success response returned
   ↓
6. Landing page fetches updated content
   ↓
7. Displays new content
```

### API Endpoints Being Used

#### 1. Initialize Default Content
```http
POST http://localhost:5000/api/v1/landing-page/initialize
Headers: Authorization: Bearer <token>
```

#### 2. Get Hero Section
```http
GET http://localhost:5000/api/v1/landing-page/hero
```

Response:
```json
{
  "success": true,
  "data": {
    "section": "hero",
    "heroTitle": "Your work,\nPowered by\nour life's work.",
    "heroSubtitle": "An all-in-one workspace...",
    "isActive": true
  }
}
```

#### 3. Update Hero Section
```http
PUT http://localhost:5000/api/v1/landing-page/hero
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "heroTitle": "New Title",
  "heroSubtitle": "New Subtitle"
}
```

#### 4. Get All Sections
```http
GET http://localhost:5000/api/v1/landing-page
```

## 🧪 Testing Checklist

### ✅ Backend Tests

- [ ] MongoDB is running
- [ ] Backend server is running on port 5000
- [ ] GET `/api/v1/landing-page/hero` returns data
- [ ] PUT `/api/v1/landing-page/hero` with auth token works
- [ ] POST `/api/v1/landing-page/initialize` creates default content

### ✅ Frontend Tests

- [ ] Landing page loads without errors
- [ ] Hero section displays text from database
- [ ] SuperAdmin can login
- [ ] Landing Page Manager page loads
- [ ] Hero section form shows current content
- [ ] Editing and saving works
- [ ] Success/Error messages appear

### ✅ Integration Tests

- [ ] Edit hero title in SuperAdmin → Save → Refresh landing page → See changes
- [ ] Initialize default content → Check MongoDB → Verify 8 sections created
- [ ] Landing page fetches hero on mount
- [ ] "Powered" word highlights correctly

## 🔧 Troubleshooting

### Problem: SuperAdmin form is empty

**Solution:**
1. Click "Reset to Default" button
2. Or manually add hero section in MongoDB:
```javascript
db.landingpagecontents.insertOne({
  section: "hero",
  heroTitle: "Your work,\nPowered by\nour life's work.",
  heroSubtitle: "An all-in-one workspace designed...",
  isActive: true
})
```

### Problem: Landing page shows default text

**Solution:**
1. Check browser console for API errors
2. Verify backend is running on port 5000
3. Check if MongoDB has hero section data
4. Verify CORS is enabled in backend

### Problem: Save button not working

**Solution:**
1. Check if you're logged in as SuperAdmin
2. Check browser console for JWT token errors
3. Verify token in localStorage: `localStorage.getItem('token')`
4. Try logging out and logging in again

### Problem: "Powered" word not highlighting

**Solution:**
- Make sure the word "Powered" exists in heroTitle
- Check that it's formatted correctly
- The code looks for the exact word "Powered" (case-sensitive)

## 📊 MongoDB Queries

### Check if hero section exists
```javascript
db.landingpagecontents.findOne({ section: "hero" })
```

### Check all sections
```javascript
db.landingpagecontents.find({})
```

### Update hero section manually
```javascript
db.landingpagecontents.updateOne(
  { section: "hero" },
  { 
    $set: { 
      heroTitle: "Your work,\nPowered by\nour life's work.",
      heroSubtitle: "An all-in-one workspace..."
    }
  }
)
```

### Delete all content (reset)
```javascript
db.landingpagecontents.deleteMany({})
```

## 🎯 Expected Behavior

### SuperAdmin Panel
1. Opens Landing Page Manager
2. Sees list of sections in sidebar
3. Clicks "Hero Section"
4. Sees form with current values from database
5. Edits the values
6. Clicks "Save Section"
7. Sees success message
8. Values are saved to MongoDB

### Landing Page
1. Page loads
2. useEffect runs
3. Fetches hero section from API
4. Updates state with fetched data
5. Displays data in hero section
6. "Powered" word is highlighted in blue
7. Line breaks (\n) are converted to <br />

## ✨ Features Working

1. ✅ **Database Storage**: Hero section data stored in MongoDB
2. ✅ **API Fetch**: Landing page fetches from backend
3. ✅ **SuperAdmin Edit**: Form shows current data
4. ✅ **Save Functionality**: Updates database on save
5. ✅ **Real-time Updates**: Changes reflect on landing page
6. ✅ **Default Content**: Can initialize default data
7. ✅ **Text Formatting**: Supports newlines and highlighting
8. ✅ **Error Handling**: Fallback to default if API fails

## 🔐 Authentication

SuperAdmin routes require JWT token:
- Token stored in: `localStorage.getItem('token')`
- Header format: `Authorization: Bearer <token>`
- Role required: `superadmin`

---

**Created:** 2026-02-07  
**Status:** ✅ Fully Functional
