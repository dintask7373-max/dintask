# Landing Page Content Management System

## Overview
Yeh ek complete dynamic content management system hai jo SuperAdmin ko landing page ke saare sections ko edit karne ki permission deta hai. SuperAdmin apne panel se text, images, cards, colors, aur pricing plans ko easily change kar sakta hai.

## Features

### ✨ Editable Sections
1. **Hero Section** 🚀
   - Title
   - Subtitle  
   - Video URL

2. **Features/Modules** ⭐
   - Multiple modules add/remove
   - Title, description, icon
   - Color gradients
   - Features list

3. **Strategic Options** 🎯
   - 3 option cards
   - Title, description
   - Custom colors (text, background, border)
   - Icons

4. **Tactical Preview** 📊
   - Title & subtitle
   - Video URL
   - Showcase images (slider)

5. **Testimonial** 💬
   - Badge text
   - Title, subtitle, description
   - Quote
   - Author details (name, role, image)
   - Background color

6. **Pricing Plans** 💰
   - Multiple plans add/remove
   - Name, price, duration
   - Description
   - Features list
   - CTA button text
   - Popular tag
   - Section background color

7. **Demo CTA** 🎬
   - Title & description
   - Button texts
   - Background color

8. **Footer** 📋
   - Description
   - Copyright text
   - Logo URL
   - Footer links

## How to Use

### For SuperAdmin

1. **Access the Page**
   - Login as SuperAdmin
   - Navigate to "Landing Page" from sidebar
   - Or visit `/superadmin/landing-page`

2. **Edit Content**
   - Click on any section from left sidebar
   - Edit the fields as needed
   - Click "Save Section" button
   - Success message will appear

3. **Reset to Default**
   - Click "Reset to Default" button in header
   - This will restore all original content

4. **Preview Changes**
   - Click "Preview" button to open landing page in new tab
   - Check your changes live

### Section-wise Editing

#### Hero Section
```javascript
Fields:
- Hero Title (textarea)
- Hero Subtitle (textarea)
- Hero Video URL (input)
```

#### Features/Modules
```javascript
For each module:
- ID (admin, manager, employee, sales)
- Title
- Description
- Icon name (ShieldCheck, LayoutDashboard, etc.)
- Color gradient (from-blue-600 to-indigo-600)
- Features (comma-separated)

Actions:
- Add Module
- Remove Module
```

#### Strategic Options
```javascript
For each option:
- ID (01, 02, 03)
- Title
- Description
- Icon (Search, Lightbulb, Target)
- Text Color (text-[#8bc34a])
- Background Color (bg-[#8bc34a])
- Border Color (border-[#8bc34a])

Actions:
- Add Option
- Remove Option
```

#### Pricing Plans
```javascript
For each plan:
- Name (Free, Pro, Pro Plus, Enterprise)
- Price ($0, $12, $29, Custom)
- Duration (Forever, member/month, etc.)
- Description
- Features (comma-separated)
- CTA Text (Get Started, Upgrade Now, etc.)
- Variant (default/outline)
- Popular checkbox

Section settings:
- Pricing Title
- Pricing Description
- Background Color (#6374f2)
```

## API Endpoints

### Public Endpoints (No Auth Required)
```
GET /api/v1/landing-page
- Get all landing page content

GET /api/v1/landing-page/:section
- Get content for specific section
- sections: hero, features, strategic_options, tactical_preview, 
           testimonial, pricing, demo_cta, footer
```

### Protected Endpoints (SuperAdmin Only)
```
PUT /api/v1/landing-page/:section
- Update content for specific section
- Requires: Bearer token

DELETE /api/v1/landing-page/:section
- Delete content for specific section
- Requires: Bearer token

POST /api/v1/landing-page/initialize
- Initialize default content (reset all)
- Requires: Bearer token
```

## Technical Details

### Backend Structure
```
Backend/
├── src/
│   ├── models/
│   │   └── LandingPageContent.js      # Mongoose schema
│   ├── controllers/
│   │   └── landingPageController.js   # CRUD operations
│   └── routes/
│       └── landingPageRoutes.js       # API routes
```

### Frontend Structure
```
Frontend/
└── src/
    └── modules/
        └── superadmin/
            └── pages/
                └── LandingPageManager.jsx  # Admin UI
```

### Database Schema
```javascript
{
  section: String (unique, required),
  // Hero
  heroTitle: String,
  heroSubtitle: String,
  heroVideoUrl: String,
  
  // Features
  modules: [{
    id, title, description, icon, color, features[]
  }],
  
  // Strategic Options
  strategicOptions: [{
    id, title, description, icon, color, bgColor, borderColor
  }],
  
  // Pricing
  plans: [{
    name, price, duration, description, 
    features[], cta, variant, popular
  }],
  pricingTitle, pricingDescription, pricingBgColor,
  
  // Testimonial
  testimonial*,
  
  // Demo CTA
  demo*,
  
  // Footer
  footer*,
  
  // Meta
  isActive: Boolean,
  lastUpdatedBy: ObjectId,
  timestamps
}
```

## Installation & Setup

### 1. Database Model
Model already created at:
`Backend/src/models/LandingPageContent.js`

### 2. Routes Added
Routes added to `Backend/src/app.js`:
```javascript
app.use('/api/v1/landing-page', landingPage);
```

### 3. Frontend Route Added
Route added to `Frontend/src/router/AppRouter.jsx`:
```javascript
<Route path="landing-page" element={<LandingPageManager />} />
```

### 4. Sidebar Link Added
Link added to SuperAdmin sidebar navigation

## Usage Example

### Initialize Default Content (First Time)
```javascript
// From SuperAdmin panel
1. Go to Landing Page Manager
2. Click "Reset to Default" button
3. Default content will be created in database
```

### Update Hero Section
```javascript
// From SuperAdmin panel
1. Click "Hero Section" from sidebar
2. Edit title: "Your work, Powered by our life's work."
3. Edit subtitle: "An all-in-one workspace..."
4. Click "Save Section"
```

### Add New Pricing Plan
```javascript
1. Go to "Pricing Plans" section
2. Click "Add Plan" button
3. Fill in:
   - Name: "Startup"
   - Price: "$19"
   - Duration: "member / month"
   - Features: "10 Users, 100GB Storage, Priority Support"
4. Click "Save Section"
```

## Color Customization

### Supported Color Formats
- Hex: `#6374f2`, `#ffcc00`
- Tailwind: `bg-[#8bc34a]`, `text-[#00BFA5]`
- Gradients: `from-blue-600 to-indigo-600`

### Example Usage
```javascript
// Testimonial Background
testimonialBgColor: "#ffcc00"

// Strategic Options
color: "text-[#8bc34a]"
bgColor: "bg-[#8bc34a]"
borderColor: "border-[#8bc34a]"

// Module Gradient
color: "from-purple-600 to-pink-600"
```

## Icon Reference

### Available Icons (Lucide React)
- ShieldCheck
- LayoutDashboard
- Target
- Briefcase
- Search
- Lightbulb
- Users
- Zap
- Star

## Best Practices

1. **Backup Before Reset**
   - Take screenshots before clicking "Reset to Default"
   
2. **Save Frequently**
   - Save each section after editing
   
3. **Preview Changes**
   - Always preview before finalizing
   
4. **Maintain Consistency**
   - Keep similar color schemes
   - Use consistent typography
   
5. **Test on Mobile**
   - Check responsive design after changes

## Troubleshooting

### Content Not Updating?
1. Check if you're logged in as SuperAdmin
2. Verify you clicked "Save Section"
3. Check browser console for errors
4. Refresh the page

### Images Not Showing?
1. Use absolute URLs or proper relative paths
2. Check if images exist in public folder
3. Verify image URLs are correct

### API Errors?
1. Check if backend server is running
2. Verify token is valid
3. Check network tab in browser dev tools

## Future Enhancements

- [ ] Image upload functionality
- [ ] Preview mode within editor
- [ ] Version history
- [ ] Undo/Redo functionality
- [ ] Drag & drop reordering
- [ ] Multi-language support
- [ ] A/B testing support

---

## Support

For any issues or questions:
1. Check this documentation
2. Contact development team
3. Review code comments in source files

**Created by:** DinTask Development Team  
**Last Updated:** 2026-02-07
