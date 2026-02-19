# New Pages Guide - Agri Forecasting Hub

## Overview

Two new pages have been added to the Agri Forecasting Hub platform:

1. **Farmer Profile Dashboard** (`/profile`)
2. **Government Schemes & Eligibility Checker** (`/schemes`)

Both pages are fully integrated with the existing design system and follow the same UI patterns as the main dashboard.

---

## Page 1: Farmer Profile Dashboard

### Route
`/profile`

### Features

#### Header Section
- Farmer name with profile photo (avatar)
- Location display (Village, District, State)
- Language switcher (English, हिन्दी, मराठी)
- Notification bell icon

#### Personal Information Card
- Age
- Gender
- Aadhaar/ID (masked for privacy)
- Mobile Number
- Bank Account Linked status (with visual indicator)
- Land Ownership Type (Owner/Tenant/Shared)

#### Farm Details Section
- Total Land Area (acres/hectares)
- Irrigation Type (Rainfed/Borewell/Canal/Drip)
- Soil Type (Loamy/Clay/Sandy)
- Crops Currently Grown (badges)
- Sowing Date
- Crop Season (Kharif/Rabi/Zaid)

#### Financial & Support Status
- Loan Status (Active/None) with visual indicators
- Insurance Status (PMFBY Enrolled/Not Enrolled)
- Subsidy Status (Active/Pending/None)

#### Actions
- **Edit Profile** button (ready for future implementation)
- **Download Profile PDF** button (functional)

### Design Features
- ✅ Mobile-responsive (mobile-first design)
- ✅ Large, readable fonts suitable for rural users
- ✅ Green and earthy color theme matching the platform
- ✅ Clear icons for each section
- ✅ Card-based layout
- ✅ Accessible and easy to navigate

---

## Page 2: Government Schemes & Eligibility Checker

### Route
`/schemes`

### Features

#### Eligibility Score Dashboard
- Overall eligibility percentage
- Visual progress bar
- Count of eligible, partially eligible, and not eligible schemes
- Summary: "You are eligible for X out of Y schemes"

#### Filter & Search
- **Search Bar**: Search by scheme name or description
- **Category Filter**: Filter by category (Subsidy, Loan, Insurance, Equipment, Irrigation, Seed Support)

#### Featured National Schemes
- Quick view cards for top 5 national schemes:
  - PM-KISAN
  - PMFBY (Crop Insurance)
  - Kisan Credit Card
  - PMKSY (Irrigation)
  - Soil Health Card Scheme

#### Scheme Cards
Each scheme card includes:
- Scheme name and ministry
- Category badge with icon
- Eligibility status indicator (✔ Eligible / ⚠ Partially Eligible / ✖ Not Eligible)
- Tabbed interface with:
  - **Description**: Scheme overview
  - **Benefits**: Financial benefits provided
  - **Eligibility**: Criteria and eligibility score (0-100%)
  - **Documents**: Required documents list
- **Apply Now** button linking to official government website

#### Eligibility Auto-Check System
- Automatically calculates eligibility based on:
  - Land size
  - Income level
  - Caste category
  - State
  - Irrigation type
  - Bank account status

#### Download Report
- Download eligibility report as PDF
- Includes all schemes and eligibility status

### Design Features
- ✅ Government-trust style UI
- ✅ Green + Blue color theme
- ✅ Cards with shadows
- ✅ Responsive design
- ✅ Simple English labels
- ✅ Icons and badges for eligibility status
- ✅ Intuitive for farmers with minimal technical language

---

## Navigation

### Header Navigation
The header now includes a navigation bar with three links:
- **Dashboard** (`/`) - Main forecasting dashboard
- **Profile** (`/profile`) - Farmer profile page
- **Schemes** (`/schemes`) - Government schemes page

The active page is highlighted with the primary color.

---

## Technical Details

### Files Created
1. `Frontend/src/pages/FarmerProfile.tsx` - Farmer Profile Dashboard
2. `Frontend/src/pages/GovernmentSchemes.tsx` - Government Schemes page

### Files Modified
1. `Frontend/src/App.tsx` - Added routes for new pages
2. `Frontend/src/components/Header.tsx` - Added navigation links

### Dependencies Used
- All existing UI components (Card, Button, Badge, etc.)
- React Router for navigation
- Existing design system (colors, typography, spacing)
- Lucide React icons
- HTML2PDF for PDF generation

---

## Data Structure

### Farmer Profile Interface
```typescript
interface FarmerProfile {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  aadhaarId: string;
  mobileNumber: string;
  bankAccountLinked: boolean;
  landOwnershipType: 'Owner' | 'Tenant' | 'Shared';
  village: string;
  district: string;
  state: string;
  totalLandArea: number;
  landUnit: 'acres' | 'hectares';
  irrigationType: 'Rainfed' | 'Borewell' | 'Canal' | 'Drip';
  soilType: 'Loamy' | 'Clay' | 'Sandy';
  cropsCurrentlyGrown: string[];
  sowingDate: string;
  cropSeason: 'Kharif' | 'Rabi' | 'Zaid';
  loanStatus: 'Active' | 'None';
  insuranceStatus: 'PMFBY Enrolled' | 'Not Enrolled';
  subsidyStatus: 'Active' | 'Pending' | 'None';
  profilePhoto?: string;
}
```

### Scheme Interface
```typescript
interface Scheme {
  id: string;
  name: string;
  ministry: string;
  category: 'Subsidy' | 'Loan' | 'Insurance' | 'Equipment' | 'Irrigation' | 'Seed Support';
  description: string;
  benefits: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialLink: string;
  eligibilityStatus: 'eligible' | 'partially-eligible' | 'not-eligible';
  eligibilityScore: number; // 0-100
}
```

---

## Future Enhancements

### Farmer Profile Page
- [ ] Connect to Supabase to fetch real farmer data
- [ ] Implement edit profile functionality
- [ ] Add profile photo upload
- [ ] Add form validation
- [ ] Connect to backend API for data persistence

### Government Schemes Page
- [ ] Connect to real government API (if available)
- [ ] Implement dynamic eligibility calculation based on farmer profile
- [ ] Add scheme application tracking
- [ ] Add notifications for new schemes
- [ ] Add scheme comparison feature
- [ ] Add favorites/bookmarks

---

## Usage

### Accessing the Pages

1. **Farmer Profile**: Navigate to `/profile` or click "Profile" in the header navigation
2. **Government Schemes**: Navigate to `/schemes` or click "Schemes" in the header navigation

### Testing

Both pages are fully functional with mock data. To test:

1. Start the development server: `npm run dev` (in Frontend directory)
2. Log in to the application
3. Use the navigation links in the header to switch between pages
4. Test all interactive features:
   - Search and filter on Schemes page
   - Download PDF functionality
   - Navigation between pages

---

## Notes

- Both pages use the existing authentication system (ProtectedRoute)
- All pages match the existing design system and color scheme
- The pages are fully responsive and mobile-friendly
- PDF download functionality uses html2pdf.js library
- Mock data is currently used - replace with real API calls when backend is ready

---

## Support

For questions or issues, refer to the main README.md or contact the development team.
